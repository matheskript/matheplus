import React from "react";
import { Mathilda } from "./func10.jsx";
import WillkommenOverlay from "./funcWillkommen.jsx";

/* Die App; direkt nach dem Passwort liegt 7 Sekunden die Willkommensseite darüber (funcWillkommen.jsx). */
export default function App() {
  return (<>
    <Mathilda />
    <WillkommenOverlay />
  </>);
}
