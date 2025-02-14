import { OG_IMAGE_URL } from "../../../utils/constants";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL;

  const config = {
    accountAssociation: {
      header:
        "eyJmaWQiOjIxNzI0OCwidHlwZSI6ImN1c3RvZHkiLCJrZXkiOiIweGViYTc4NzE3YjZmMDU5Q0ZFMGI3NUU3NUMyZWQ0QkI3Y0E2NTE1NEYifQ",
      payload: "eyJkb21haW4iOiJlbnMtYXBwLXYzLWxlbW9uLnZlcmNlbC5hcHAifQ",
      signature:
        "MHg0NmUxY2YxNjc1NTFjZjBlZmE4MWE1YWQ4Mjc5Yzc4NzFiODRjMGVlMjBhYTAwYzJjZmQ2NjVhM2UxNGNhMDA5MTU4MmEzYWNkNTIzODJiMzc4YjVlYzEyMjI1ZGU2MDk4MjI5ODc1YWIwOGIxYjRiNzk0ZWI0MWNiMDZhOTlhMDFj",
    },
    frame: {
      version: "1",
      name: "ENS",
      iconUrl: `${appUrl}/apple-touch-icon.png`,
      homeUrl: appUrl,
      imageUrl: `${OG_IMAGE_URL}/address/0x653Ff253b0c7C1cc52f484e891b71f9f1F010Bfb`,
      buttonTitle: "Launch ENS",
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#f7f7f7",
      webhookUrl: `${appUrl}/api/webhook`,
    },
  };

  return Response.json(config);
}