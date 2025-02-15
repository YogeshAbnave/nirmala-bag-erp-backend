const clientModel = require("../models/client.model.js");
const cloudinary = require("../../config/cloudinary");
const fs = require("fs").promises;

exports.addClient = async (req, res) => {
  try {
    const { name, mobile, email, address, landmark, city, size, discussion } =
      req.body;
    const imageUrls = [];

    // Upload each file to Cloudinary
    for (const file of req.files) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "clients",
          resource_type: "auto",
          timeout: 120000,
        });

        imageUrls.push(result.secure_url);

        // Remove the file from local storage
        await fs.unlink(file.path);
      } catch (error) {
        console.error("Cloudinary upload error:", error);
        return res.status(500).json({ message: "Image upload failed" });
      }
    }

    // Save client data to MongoDB
    const newClient = await clientModel.create({
      name,
      mobile,
      email,
      address,
      landmark,
      city,
      size,
      discussion,
      imageUrls,
    });

    await newClient.save();

    return res
      .status(201)
      .json({ message: "Client saved successfully!", data: newClient });
  } catch (error) {
    console.error("Server Error:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await clientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    if (client.image) {
      const imagePublicId = client.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`clients/${imagePublicId}`);
    }

    await clientModel.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const { name, mobile, email, address, landmark, city, size, discussion } =
      req.body;
    // Check if email exists and belongs to another client
    const existingClient = await clientModel.findOne({ email });
    if (existingClient && existingClient._id.toString() !== req.params.id) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Fetch the existing client
    const client = await clientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    let imageUrls = client.imageUrl || []; // Keep old images if no new ones are uploaded

    // Upload new images to Cloudinary
    if (req.files && req.files.length > 0) {
      imageUrls = []; // Clear old images if new ones are uploaded

      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "clients",
            resource_type: "auto",
            timeout: 120000,
          });

          imageUrls.push(result.secure_url);

          // Remove the file from local storage
        } catch (uploadError) {}
      }

      // Remove old Cloudinary images
      if (client.imageUrl && Array.isArray(client.imageUrl)) {
        for (const oldImage of client.imageUrl) {
          const publicId = oldImage.split("/").pop().split(".")[0]; // Extract public ID
          try {
            await cloudinary.uploader.destroy(`clients/${publicId}`);
          } catch (cloudinaryError) {
            console.warn(
              `Failed to delete old image: ${oldImage}`,
              cloudinaryError
            );
          }
        }
      }
    }
    const newUrl = imageUrls;
    // Update client data
    const updatedClient = await clientModel.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name,
          mobile,
          email,
          address,
          landmark,
          city,
          size,
          discussion,
          imageUrls: newUrl, // Force update
        },
      },
      { new: true, runValidators: true }
    );

    res.json({ message: "Client updated successfully", updatedClient });
  } catch (error) {
    console.error("Error updating client:", error);
    res
      .status(500)
      .json({ message: "Error updating client", error: error.message });
  }
};

exports.getAllClient = async (req, res) => {
  try {
    const clients = await clientModel.find();
    return res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};

exports.getByIdClient = async (req, res) => {
  try {
    const client = await clientModel.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    return res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
};
