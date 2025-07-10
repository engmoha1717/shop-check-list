import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { WebhookEvent } from "@clerk/nextjs/server";
import { Webhook } from "svix";
import { api } from "./_generated/api";





const http = httpRouter()

//clerk webhook handler
http.route({
    path:"/clerk-webhook",
    method:"POST",
   handler: httpAction(async (ctx ,request)=>{
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing CLERK_WEBHOOK_SECRET environment variable");
        return new Response("Webhook secret not configured", { status: 500 });
      }
      // Get the headers
    const svix_id = request.headers.get("svix-id");
    const svix_timestamp = request.headers.get("svix-timestamp");
    const svix_signature = request.headers.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    // Get the body
    const body = await request.text();

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(webhookSecret);

    let evt: WebhookEvent;

    // Verify the webhook
    try {
        evt = wh.verify(body, {
          "svix-id": svix_id,
          "svix-timestamp": svix_timestamp,
          "svix-signature": svix_signature,
        }) as WebhookEvent;
      } catch (err) {
        console.error("Error verifying webhook:", err);
        return new Response("Error occurred", {
          status: 400,
        });
      }

      // Handle the webhook
    const eventType = evt.type;
    console.log(`Webhook received: ${eventType}`);

    try {

    switch (eventType) {
        case "user.created":
        case "user.updated":{
          const { id, email_addresses, first_name, last_name, image_url } = evt.data;

          const email = email_addresses?.[0]?.email_address || "";
          const name = `${first_name || ""} ${last_name || ""}`.trim() || "User";
          await ctx.runMutation(api.users.createUser,{
            clerkId:id,
            email,
            name,
            image: image_url
          })

        }
        default:
            console.log(`Unhandled webhook event: ${eventType}`);
        
    }
        
        return new Response("Webhook processed successfully", { status: 200 });
    } catch (error) {
      console.error("Error processing webhook:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
   })
})

export default http