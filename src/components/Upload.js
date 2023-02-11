import React, { useState } from "react";

const Upload = () => {
	const [selectedFile, setSelectedFile] = useState(null);

	const onFileChange = event => {
		setSelectedFile(event.target.files[0]);
	};

	const onFormSubmit = async event => {
		event.preventDefault();
		const formData = new FormData();
		formData.append("image", selectedFile);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData
			});
			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<form onSubmit={onFormSubmit}>
			<input type="file" onChange={onFileChange} />
			<button type="submit">Upload Image</button>
		</form>
	);
};

export default Upload;
