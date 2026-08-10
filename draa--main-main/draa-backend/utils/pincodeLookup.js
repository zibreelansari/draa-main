const PINCODE_API_BASE = "https://api.postalpincode.in/pincode";

const normalizeAddressForPincode = (address, postOffice) => ({
  ...address,
  area: address.area || postOffice.Name || "",
  city: postOffice.Block && postOffice.Block !== "NA" ? postOffice.Block : postOffice.District || "",
  district: postOffice.District || "",
  state: postOffice.State || "",
  country: "India"
});

const validateIndianPincodeAddress = async (address) => {
  if (!address || typeof address !== "object") {
    return { valid: false, message: "Delivery address is required" };
  }

  const pincode = String(address.pincode || "").trim();
  if (!/^\d{6}$/.test(pincode)) {
    return { valid: false, message: "Please enter a valid 6-digit pincode" };
  }

  try {
    const response = await fetch(`${PINCODE_API_BASE}/${pincode}`);
    const data = await response.json();
    const postOffices = data[0]?.Status === "Success" && Array.isArray(data[0].PostOffice)
      ? data[0].PostOffice
      : [];

    if (!postOffices.length) {
      return { valid: false, message: "Invalid pincode or pincode not found" };
    }

    const requestedArea = String(address.area || "").trim().toLowerCase();
    const matchedPostOffice = requestedArea
      ? postOffices.find(po => String(po.Name || "").trim().toLowerCase() === requestedArea)
      : postOffices[0];

    if (!matchedPostOffice) {
      return {
        valid: false,
        message: "Selected area does not belong to this pincode",
        suggestions: postOffices.map(po => po.Name).filter(Boolean)
      };
    }

    return {
      valid: true,
      address: normalizeAddressForPincode({
        ...address,
        pincode,
        area: matchedPostOffice.Name || address.area || ""
      }, matchedPostOffice),
      suggestions: postOffices.map(po => po.Name).filter(Boolean)
    };
  } catch (error) {
    return {
      valid: false,
      message: "Could not verify pincode right now. Please try again."
    };
  }
};

module.exports = {
  validateIndianPincodeAddress
};
