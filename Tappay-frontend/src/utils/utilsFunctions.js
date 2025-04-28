// export const removeNullValues = (object) => {
//     return Object.fromEntries(
//       Object.entries(object).filter(([_, value]) => value !== null)
//   );
// };

export const removeNullValues = (object) => {
  // Base case: Return non-object values as is
  if (typeof object !== "object" || object === null) {
    return object;
  }

  // If the object is an array, process each element and filter out nulls
  if (Array.isArray(object)) {
    const filteredArray = object
      .map(removeNullValues) // Recursively process array elements
      .filter((value) => value !== null && !Number.isNaN(value)); // Remove null values
    return filteredArray.length > 0 ? filteredArray : null; // Return null if the array is empty
  }

  // If the object is not an array, process it as a regular object
  const filteredObject = Object.fromEntries(
    Object.entries(object)
      .map(([key, value]) => [key, removeNullValues(value)]) // Recursively clean children
      .filter(
        ([_, value]) =>
          value !== null &&
          !Number.isNaN(value) && // Remove null values
          (typeof value !== "object" || Object.keys(value).length > 0)
      ) // Remove empty objects
  );

  // Return the cleaned object, or null if it becomes empty
  return Object.keys(filteredObject).length > 0 ? filteredObject : null;
};

export const validatePassword = (password) => {
  // Regular expression to check for the above criteria
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Check if the password matches the criteria
  if (!passwordRegex.test(password)) {
    return false; // Validation failed
  }

  return true; // Validation passed
};

export const handleScan = (barcode, products, onScan, setAlert) => {
  console.log(barcode);
  console.log("products: ", products);
  const product = products.find((p) => {
    if (p.productDetails) {
      return p.productDetails.barcodes.some((b) => b.barcode === barcode);
    } else {
      return p.barcodes.some((b) => b.barcode === barcode);
    }
  });
  if (product) {
    onScan(product);
  } else {
    setAlert({
      message: "Product not found!",
      type: "error",
    });
    setTimeout(() => setAlert(null), 1500);
  }
};

export const handleError = (setAlert) => {
  setAlert({
    message: "Barcode scan error!",
    type: "error",
  });
  setTimeout(() => setAlert(null), 1500);
};
