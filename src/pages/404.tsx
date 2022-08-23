import Link from 'next/link'

export default function FourOhFour() {
	return <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
		<h1 className="text-3xl leading-normal font-extrabold text-gray-700">
			Flabébé - URL Shortener
		</h1>

		<h2 className="text-2xl my-8">The requested link does not exists or is expired</h2>

		<Link href="/">
			<a className="text-lg text-red-500">
				Go back home
			</a>
		</Link>
	</main>
}
