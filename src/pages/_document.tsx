import { Html, Head, Main, NextScript } from "next/document";
import Document, { DocumentContext } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="ro">
        <Head>
          {/* 👇 AICI SUNT LINIILE PENTRU FAVICON SI LOGO GOOGLE */}
          
          {/* 1. Favicon clasic (pentru tab-uri browser) */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          
          {/* 2. Logo modern (PNG) - Pe acesta îl ia Google de obicei */}
          <link rel="icon" href="/favicon.ico" type="image/ico" />
          
          {/* 3. Iconiță pentru Apple/iOS (când salvezi site-ul pe ecran) */}
          <link rel="apple-touch-icon" href="/favicon.ico" />
          
          {/* 4. Culoarea barei de adrese pe mobil (să fie neagră ca site-ul) */}
          <meta name="theme-color" content="#000000" />
        </Head>
      
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;