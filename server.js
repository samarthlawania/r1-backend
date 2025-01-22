const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(express.json());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Email Layout API
app.get("/api/getEmailLayout", (req, res) => {
  res.status(200).json({
    title: "Sample Email Layout",
    content: "This is a test email layout.",
    imageUrl: "/uploads/sample-image.png",
  });
});

// Handle image path storage
app.post("/api/upload", (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({
      success: false,
      message: "No image path provided.",
    });
  }

  console.log(`Image path saved: ${imageUrl}`);

  res.status(200).json({
    success: true,
    imageUrl: imageUrl,
    message: "Image path saved successfully!",
  });
});

const emailConfigs = []; // Temporary in-memory storage

// Save email configuration
app.post("/api/uploadEmailConfig", (req, res) => {
  const { title, content, imageUrl } = req.body;

  if (!title || !content || !imageUrl) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: title, content, or imageUrl.",
    });
  }

  const newConfig = { id: Date.now(), title, content, imageUrl };
  emailConfigs.push(newConfig);

  console.log("Email configuration saved:", newConfig);

  res.status(200).json({
    success: true,
    message: "Email configuration saved successfully!",
  });
});

// Get saved email configurations
app.get("/api/getEmailConfigs", (req, res) => {
  res.status(200).json(emailConfigs);
});

app.post("/api/renderAndDownloadTemplate", (req, res) => {
  try {
    const config = req.body;
    console.log("Received config:", {
      ...config,
      imageUrl: config.imageUrl ? "Base64 image data (truncated)" : "No image",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${config.title || "Email Template"}</title>
          <style>
            body {
              font-family: ${config.fontFamily || "Arial, sans-serif"};
              padding: ${config.spacing?.padding || "32px"};
              background-color: #f4f4f4;
            }
            .content {
              padding: 20px;
              border-radius: 8px;
              max-width: 600px;
              margin: auto;
              background: #fff;
            }
            h1 {
              color: ${config.primaryColor || "#333"};
            }
          </style>
        </head>
        <body>
          <div class="content">
            <h1>${config.title || "Welcome!"}</h1>
            <p>${config.content || "Your email content goes here."}</p>
            ${
              config.imageUrl
                ? `<img src="${config.imageUrl}" alt="Embedded Image" style="max-width: 100%;">`
                : ""
            }
          </div>
        </body>
      </html>
    `;

    res.setHeader("Content-Type", "text/html");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="email_template.html"`
    );
    res.send(html);
  } catch (error) {
    console.error("Error generating template:", error);
    res
      .status(500)
      .json({ message: "Error generating template", error: error.message });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
