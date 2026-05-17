export const getErrorMessage = async (error: any) => {
  if (!error) return null;

  let data = error.response?.data;

  if (data instanceof Blob) {
    try {
      const text = await data.text();
      console.log("test out:", text);
      data = JSON.parse(text);
    } catch (error) {
      console.error(error);
      return "Failed to read an error from the file.";
    }
  }

  if (data?.message === "Validation failed") {
    return data.errors[0]?.message || "Validation error";
  }

  return data?.message || error.message || "Something went wrong.";
};
