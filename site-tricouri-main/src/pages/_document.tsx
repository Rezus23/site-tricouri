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
         <link rel="icon" href="/favicon-nou.png" type="image/jpeg" />
        <link rel="shortcut icon" href="/favicon-nou.png" type="image/jpeg" />
  
 
          
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