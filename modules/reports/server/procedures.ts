import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { prisma } from "@/lib/db";

export const reportsRouter = createTRPCRouter({
    uploadPdf: baseProcedure
        .input(
            z.object({
                fileName: z.string().min(1, { message: "File name is required" }),
                fileData: z.string().min(1, { message: "File data is required" }), // base64 string
            }),
        )
        .mutation(async ({ input }) => {
            const { fileName, fileData } = input;

            // Validate base64 format
            if (!fileData.startsWith("data:application/pdf;base64,")) {
                throw new Error("Invalid PDF file format");
            }

            // Extract base64 data (remove data URL prefix)
            const base64Data = fileData.split(",")[1];

            // Call n8n webhook
            const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "https://vaibee.app.n8n.cloud/webhook-test/legal-document";
            
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fileName,
                        fileData: base64Data, // Send base64 without prefix
                        fileDataUrl: fileData, // Send full data URL as well
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                return {
                    success: true,
                    result,
                    fileName,
                };
            } catch (error) {
                console.error("Error calling n8n webhook:", error);
                throw new Error(
                    error instanceof Error
                        ? error.message
                        : "Failed to process PDF with n8n workflow"
                );
            }
        }),

    saveContactInfo: baseProcedure
        .input(
            z.object({
                projectId: z.string().min(1, { message: "Project ID is required" }),
                gmailAddress: z
                    .string()
                    .email({ message: "Please enter a valid Gmail address" })
                    .refine(
                        (email) => email.endsWith("@gmail.com"),
                        { message: "Please enter a Gmail address (@gmail.com)" }
                    ),
            }),
        )
        .mutation(async ({ input }) => {
            const { projectId, gmailAddress } = input;

            // Save or update contact info in database
            const contactInfo = await prisma.contactInfo.upsert({
                where: {
                    projectId: projectId,
                },
                update: {
                    gmailAddress: gmailAddress,
                },
                create: {
                    projectId: projectId,
                    gmailAddress: gmailAddress,
                },
            });

            // Call n8n webhook for Gmail integration
            const n8nWebhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL || "https://vaibee.app.n8n.cloud/webhook-test/get-contact-information";
            
            try {
                const response = await fetch(n8nWebhookUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        projectId,
                        gmailAddress,
                        timestamp: new Date().toISOString(),
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`n8n webhook error: ${response.status} - ${errorText}`);
                }

                const result = await response.json();
                return {
                    success: true,
                    result,
                    contactInfo,
                    gmailAddress,
                    projectId,
                };
            } catch (error) {
                console.error("Error calling n8n webhook:", error);
                // Still return success if database save worked, even if webhook failed
                return {
                    success: true,
                    contactInfo,
                    gmailAddress,
                    projectId,
                    webhookError: error instanceof Error ? error.message : "Webhook call failed",
                };
            }
        }),
});

