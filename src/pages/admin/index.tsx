import { useCallback, useState, useEffect, FC } from "react";
import type { Dispatch, SetStateAction } from "react";

import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";
import { useDropzone } from "react-dropzone";

const Login = () => {
	return <main className="container mx-auto flex flex-col items-center justify-center h-screen w-96 p-4">
		<button
			className="px-7 py-3 bg-gray-100 hover:bg-gray-200 font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out w-full flex justify-center items-center"
			onClick={() => signIn('github')}
		>
			Login with GitHub
		</button>
	</main>
}

const ERROR_MESSAGE_DURATION = 3000;

function CreateShortLink() {
	const { mutateAsync, isLoading, error, data } = trpc.useMutation(["admin.slug.create"]);

	const [url, setUrl] = useState<string>();
	const [slug, setSlug] = useState<string | null>(null);
	const [expires, setExpires] = useState(false);

	const [submitText, setSubmitText] = useState("Create");

	const handleForm = useCallback(() => {
		if (!url) return;

		setSubmitText("Creating...");

		let expiresAt = null;
		if (expires) {
			const expireDate = new Date();
			expireDate.setDate(expireDate.getDate() + 1);
			expiresAt = expireDate.toISOString();
		}

		mutateAsync({ url, slug, expiresAt }).then(() => {
			setSubmitText("Created");
		}).catch(() => { });
	}, [mutateAsync, url, slug, expires]);

	useEffect(() => {
		if (!error) return;

		let message;
		try {
			message = JSON.parse(error.message)[0].message;
		} catch (e) {
			message = error.message;
		}

		setSubmitText(message);

		const code = setTimeout(() => {
			setSubmitText("Create");
		}, ERROR_MESSAGE_DURATION);

		return () => {
			clearInterval(code);
		}
	}, [error]);

	useEffect(() => {
		if (!data) return;

		setSlug(data.slug);
	}, [data]);

	const handleFormChange = (setter: (a: string) => void, value: string) => {
		setSubmitText("Create");
		setter(value);
	}

	return (<section className="w-full max-w-md mt-16 flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl">
		<h2 className="text-lg">Create new short link</h2>

		<form className="mt-6" onSubmit={(e) => {
			e.preventDefault();

			handleForm();
		}}>
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="url">
					URL
				</label>
				<input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="url" type="text" placeholder="https://" value={url} onChange={({ target: { value } }) => handleFormChange(setUrl, value)} />
			</div>
			<div className="mb-6">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
					Slug <span className="text-gray-500 font-normal">(leave empty to auto-generate)</span>
				</label>
				<input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="slug" type="slug" value={slug || ""} onChange={({ target: { value } }) => handleFormChange(setSlug, value)} />
			</div>
			<div>
				<label className="inline-flex items-center">
					<input type="checkbox" style={{ outline: 'none', boxShadow: 'none' }} checked={expires} onChange={({ target: { checked } }) => setExpires(checked)} />
					<span className="ml-2">Expires after 24h</span>
				</label>
			</div>
			<div className="flex items-end justify-end">
				<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={isLoading}>
					{submitText}
				</button>
			</div>
		</form>
	</section>);
}

function UploadFile() {
	const { mutateAsync } = trpc.useMutation(["admin.files.get-upload-url"]);
	const [downloadUrl, setDownloadUrl] = useState<string>();
	const [copyText, setCopyText] = useState("Copy");

	useEffect(() => {
		if (!downloadUrl) return;

		setCopyText("Copy");
	}, [downloadUrl]);

	return (<section className="w-full max-w-md mt-16 flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl">
		<h2 className="text-lg">Upload a file</h2>
		<p>Expires after 24h</p>

		<div className="mt-6">
			<Dropzone onDrop={async (files) => {
				const file = files[0];
				if (!file) return;

				const { uploadUrl, downloadUrl } = await mutateAsync({
					fileName: file.name,
					fileExtension: file.name.split('.').pop() || '.txt',
					contentType: file.type || 'text/plain',
				})

				const res = await fetch(uploadUrl, {
					method: 'PUT',
					body: file
				})

				if (!res.ok) {
					throw new Error(`${res.status}: ${res.statusText}`);
				}

				setDownloadUrl(`${location.host}${downloadUrl}`);
			}} />

			{
				downloadUrl && <div className="mt-6 flex items-center justify-between">
					<span>
						{downloadUrl}
					</span>

					<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
						onClick={() => {
							navigator.clipboard.writeText(downloadUrl);
							setCopyText("Copied");
						}}>
						{copyText}
					</button>
				</div>
			}
		</div>
	</section>);
}

const Dropzone: FC<{
	onDrop: (files: File[]) => void
}> = ({ onDrop }) => {
	const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

	let rootClasses = "transition-colors duration-300 py-8 px-2 outline-4 outline-gray-500 outline-dotted";

	if (isDragActive) rootClasses += " bg-blue-300"
	return (
		<div {...getRootProps()} className={rootClasses}>
			<input {...getInputProps()} />
			<p className="text-center cursor-pointer">
				{
					isDragActive
						? "Drop the files here ..."
						: "Drag 'n' drop some files here, or click to select files"
				}
			</p>
		</div>
	)
}

const Admin = () => {
	const { data } = useSession();

	if (!data) {
		return <Login />;
	} else {
		return <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
			<button
				className="w-96 px-7 py-3 bg-gray-100 hover:bg-gray-200 font-medium text-sm leading-snug uppercase rounded shadow-md hover:shadow-lg focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg transition duration-150 ease-in-out flex justify-center items-center"
				onClick={() => signOut()}
			>
				Logout
			</button>

			{
				data.user
					? <>
						<CreateShortLink />
						<UploadFile />
					</>
					: <p className="mt-10 text-3xl text-center">You are not authorized</p>
			}

		</main>
	}
}

export default Admin;
