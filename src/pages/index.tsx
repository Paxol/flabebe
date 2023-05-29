import type { NextPage } from "next";
import Head from "next/head";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Flabébé - URL Shortener</title>
        <meta name="description" content="Flabébé - URL Shortener from Paxol" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto flex flex-col items-center justify-center h-screen p-4">
        <h1 className="text-5xl md:text-[5rem] leading-normal font-extrabold text-gray-700">
          Flabébé - URL Shortener
        </h1>
        <p className="text-2xl text-gray-700">Made with ❤ from <a className="text-red-500 underline" href="http://github.com/Paxol/">Paxol (GitHub)</a></p>
      </main>
    </>
  );
};

export default Home;
