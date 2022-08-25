import { useCallback, useState, useEffect, FC } from "react";

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

function CreateAPIKey() {
	const { mutateAsync, isLoading, error } = trpc.useMutation(["admin.api.create-api-key"]);
	const tctx = trpc.useContext();

	const [token, setToken] = useState<string | null>(null);
	const [identifier, setIdentifier] = useState<string | null>(null);

	const [submitText, setSubmitText] = useState("Create");
	const [copyText, setCopyText] = useState("Copy");

	useEffect(() => {
		if (!error) return;

		let message;
		try {
			message = JSON.parse(error.message)[0].message;
		} catch (e) {
			if (error.message.includes("Unique constraint failed")) {
				message = "Identifier already exists";
			} else {
				message = "An error occurred";
				console.error(error)
			}
		}

		setSubmitText(message);
	}, [error]);

	const handleForm = useCallback(() => {
		if (!identifier || identifier.length === 0) return;

		setSubmitText("Creating...");

		mutateAsync({ identifier }).then((data) => {
			tctx.invalidateQueries("admin.api.get-api-key-identifiers");

			setSubmitText("Created");
			setToken(data.token);
			setCopyText("Copy");
		}).catch(() => { });
	}, [mutateAsync, identifier, tctx]);

	const handleFormChange = useCallback((setter: (a: string) => void, value: string) => {
		setSubmitText("Create");
		setter(value);
	}, []);

	return (<section className="w-full max-w-md mt-16 flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl">
		<h2 className="text-lg">Create API key</h2>
		<p>Expires after 6 month</p>
		<form className="mt-6" onSubmit={(e) => {
			e.preventDefault();

			handleForm();
		}}>
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="slug">
					Identifier
				</label>
				<input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" id="identifier" type="text" value={identifier || ""} onChange={({ target: { value } }) => handleFormChange(setIdentifier, value)} />
			</div>

			<div className="flex items-end justify-end">
				<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={isLoading}>
					{submitText}
				</button>
			</div>
		</form>

		{
			token && <div className="mt-6 flex items-center justify-between">
				<pre className="flex-1 overflow-x-auto">
					{token}
				</pre>

				<button className="ml-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
					onClick={() => {
						navigator.clipboard.writeText(token);
						setCopyText("Copied");
					}}>
					{copyText}
				</button>
			</div>
		}
	</section>);
}

function RenewAPIKey() {
	const identifiers = trpc.useQuery(["admin.api.get-api-key-identifiers"]);
	const { mutateAsync, isLoading, error } = trpc.useMutation(["admin.api.renew-api-key"]);

	const [selectedIndex, setSelectedIndex] = useState<number>(-1);

	const [submitText, setSubmitText] = useState("Renew");

	useEffect(() => {
		if (!error) return;

		let message;
		try {
			message = JSON.parse(error.message)[0].message;
		} catch (e) {
			message = "An error occurred";
			console.error(error)
		}

		setSubmitText(message);

		const code = setTimeout(() => {
			setSubmitText("Renew");
		}, ERROR_MESSAGE_DURATION);

		return () => {
			clearInterval(code);
		}
	}, [error]);

	const handleForm = useCallback(() => {
		if (selectedIndex < 0 || !identifiers.data) return;

		setSubmitText("Renewing...");

		mutateAsync({ identifier: identifiers.data[selectedIndex]?.identifier }).then(() => {
			setSubmitText("Renewed");
		}).catch(() => { });
	}, [mutateAsync, selectedIndex, identifiers]);

	return (<section className="w-full max-w-md mt-16 flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl">
		<h2 className="text-lg">Renew API key</h2>
		<form className="mt-6" onSubmit={(e) => {
			e.preventDefault();

			handleForm();
		}}>
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
					Identifier
				</label>
				<select id="identifier" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={({ target: { value } }) => { setSelectedIndex(Number(value)) }}>
					<option value="-1">Choose an identifier</option>

					{
						identifiers.data && identifiers.data.map(({ identifier: id }, idx) => <option key={id} value={idx}>{id}</option>)
					}
				</select>
			</div>

			<div className="flex items-end justify-end">
				<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit" disabled={isLoading}>
					{submitText}
				</button>
			</div>
		</form>
	</section>);
}

function DeleteAPIKey() {
	const identifiers = trpc.useQuery(["admin.api.get-api-key-identifiers"]);
	const { mutateAsync, isLoading, error } = trpc.useMutation(["admin.api.remove-api-key"]);
	const tctx = trpc.useContext();

	const [selectedIndex, setSelectedIndex] = useState<number>(-1);

	const [submitText, setSubmitText] = useState("Delete");

	useEffect(() => {
		if (!error) return;

		let message;
		try {
			message = JSON.parse(error.message)[0].message;
		} catch (e) {
			message = "An error occurred";
			console.error(error)
		}

		setSubmitText(message);

		const code = setTimeout(() => {
			setSubmitText("Delete");
		}, ERROR_MESSAGE_DURATION);

		return () => {
			clearInterval(code);
		}
	}, [error]);

	const handleForm = useCallback(() => {
		if (selectedIndex < 0 || !identifiers.data) return;

		setSubmitText("Deleting...");

		mutateAsync({ identifier: identifiers.data[selectedIndex]?.identifier }).then(() => {
			tctx.invalidateQueries("admin.api.get-api-key-identifiers");
			setSubmitText("Deleted");
		}).catch(() => { });
	}, [mutateAsync, selectedIndex, identifiers, tctx]);

	return (<section className="w-full max-w-md mt-16 flex flex-col justify-center p-6 duration-500 border-2 border-gray-500 rounded shadow-xl">
		<h2 className="text-lg">Delete API key</h2>
		<form className="mt-6" onSubmit={(e) => {
			e.preventDefault();

			handleForm();
		}}>
			<div className="mb-4">
				<label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="identifier">
					Identifier
				</label>
				<select id="identifier" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={({ target: { value } }) => { setSelectedIndex(Number(value)) }}>
					<option value="-1">Choose an identifier</option>

					{
						identifiers.data && identifiers.data.map(({ identifier: id }, idx) => <option key={id} value={idx}>{id}</option>)
					}
				</select>
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

			{
				data.user
					? <>
						<CreateAPIKey />
						<RenewAPIKey />
						<DeleteAPIKey />
					</>
					: <p className="mt-10 text-3xl text-center">You are not authorized</p>
			}

		</main>
	}
}

export default Admin;
