import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error("[v0] GEMINI_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          error:
            "GEMINI_API_KEY environment variable is not configured. Please add your Gemini API key to the Vars section in the left sidebar.",
          setupLink: "https://aistudio.google.com/app/apikeys",
        },
        { status: 500 },
      )
    }

    const { frames, fileName } = await request.json()

    if (!frames || frames.length === 0) {
      return NextResponse.json({ error: "No frames provided for analysis" }, { status: 400 })
    }

    const payload = JSON.stringify({ frames, fileName })
    const payloadSizeMB = Buffer.byteLength(payload) / (1024 * 1024)

    if (payloadSizeMB > 15) {
      return NextResponse.json(
        {
          error: `Payload too large (${payloadSizeMB.toFixed(2)}MB). Please upload a smaller video or reduce quality.`,
        },
        { status: 413 },
      )
    }

    const parts = [
      {
        text: `Analyze these traffic video frames and provide detailed insights. Return a JSON object with the following structure (IMPORTANT: Return ONLY valid JSON, no markdown formatting):
{
  "vehicleCount": number,
  "trafficDensity": "Light" | "Moderate" | "Heavy" | "Congested",
  "averageSpeed": number,
  "congestionLevel": number (0-100),
  "detectedVehicles": [
    { "type": "Car" | "Truck" | "Bus" | "Motorcycle", "count": number, "confidence": number (0-1) }
  ],
  "flowRate": number,
  "anomalies": [string],
  "processingQuality": "Low" | "Medium" | "High",
  "insights": [string]
}

Video filename: ${fileName}

Analyze the frames carefully and provide realistic traffic metrics. Be specific and detailed in your analysis.`,
      },
      ...frames.map((frameBase64: string) => ({
        inline_data: {
          mime_type: "image/jpeg",
          data: frameBase64,
        },
      })),
    ]

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts,
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error("[v0] Gemini API error:", errorData)

      if (response.status === 401) {
        return NextResponse.json(
          {
            error: "Invalid Gemini API key. Please check your API key in the Vars section.",
            setupLink: "https://aistudio.google.com/app/apikeys",
          },
          { status: 401 },
        )
      }

      if (response.status === 413) {
        return NextResponse.json(
          { error: "Request payload too large for Gemini API. Please use a smaller video file." },
          { status: 413 },
        )
      }

      return NextResponse.json(
        { error: "Failed to analyze video with Gemini API", details: errorData },
        { status: response.status },
      )
    }

    const data = await response.json()

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!textContent) {
      return NextResponse.json({ error: "No content in Gemini response" }, { status: 500 })
    }

    console.log("[v0] Gemini response:", textContent)

    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json(
        { error: "Could not parse JSON from Gemini response", response: textContent },
        { status: 500 },
      )
    }

    const results = JSON.parse(jsonMatch[0])
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] API route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}
