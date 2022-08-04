import { useCallback, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";

import { signIn, signOut, useSession } from "next-auth/react";
import { trpc } from "../../utils/trpc";

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
			console.log('setTimeout')
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

			<CreateShortLink />
		</main>
	}
}

export default Admin;
