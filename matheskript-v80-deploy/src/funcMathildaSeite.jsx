/* Mathilda AI – Kopfbereich, Modus-Wahl und illustrierte Foto-Anleitung.
   Reine Darstellung: die Foto-Logik (Kamera, Galerie, Analyse) bleibt in func10.jsx. */
import React from "react";
import { C } from "./base1.jsx";
import "@fontsource/caveat/600.css";

const GOLD = C.flaggold;
const NACHT = C.seeTief;

/* Mathilda: das Foto selbst, in die drei Logofarben zerlegt (Einverständnis der abgebildeten
   Person einholen). Nichts gezeichnet – Personenmaske und Haut/Haar-Grenze per GrabCut, dunkle Stellen
   im Gesicht als Fläche, weichere Schatten als feine Punkte, Haar nur Gold mit feinen Konturlinien
   (Kanten aus dem Foto); alles vektorisiert im Raster 320 × 440. Gold = Haar, Weiß = Haut, Nachtblau = Schatten. */
const MATHILDA_HAAR = "M192.4 88.5Q188.5 85.0 183.5 82.5Q178.5 80.0 175.4 80.0Q172.2 80.0 169.9 82.0Q167.5 84.0 163.4 84.5Q159.2 85.0 158.9 85.5Q158.5 86.0 145.9 86.5Q133.2 87.0 132.9 86.5Q132.5 86.0 128.4 85.5Q124.2 85.0 122.4 83.5Q120.5 82.0 117.9 82.0Q115.2 82.0 112.4 83.5Q109.5 85.0 104.9 85.5Q100.2 86.0 99.9 86.5Q99.5 87.0 96.9 87.5Q94.2 88.0 89.1 93.1Q84.0 98.2 78.0 107.2Q72.0 116.2 71.0 121.9Q70.0 127.5 72.0 131.4Q74.0 135.2 74.0 139.4Q74.0 143.5 73.5 143.9Q73.0 144.2 72.5 147.9Q72.0 151.5 71.0 153.4Q70.0 155.2 70.0 175.9Q70.0 196.5 69.0 198.4Q68.0 200.2 67.5 203.4Q67.0 206.5 66.0 208.5Q65.0 210.5 63.5 211.9Q62.0 213.2 62.0 216.9Q62.0 220.5 63.0 222.4Q64.0 224.2 64.0 242.4Q64.0 260.5 64.5 260.9Q65.0 261.2 65.0 264.4Q65.0 267.5 66.0 269.4Q67.0 271.2 67.0 274.4Q67.0 277.5 68.0 279.4Q69.0 281.2 69.0 293.9Q69.0 306.5 66.5 312.0Q64.0 317.5 59.2 322.8Q54.5 328.0 50.5 329.5Q46.5 331.0 43.4 331.5Q40.2 332.0 38.9 333.0Q37.5 334.0 36.4 334.0Q35.2 334.0 34.4 335.0Q33.5 336.0 31.9 336.0Q30.2 336.0 24.9 341.0Q19.5 346.0 18.9 346.0Q18.2 346.0 12.9 351.5Q7.5 357.0 3.8 357.0Q0.0 357.0 0.0 398.4Q0.0 439.8 128.4 439.8Q256.8 439.8 256.8 433.5Q256.8 427.2 256.2 426.9Q255.8 426.5 255.2 418.4Q254.8 410.2 254.2 409.9Q253.8 409.5 253.8 406.9Q253.8 404.2 253.2 403.9Q252.8 403.5 252.2 398.9Q251.8 394.2 250.8 391.9Q249.8 389.5 249.8 387.4Q249.8 385.2 249.2 384.9Q248.8 384.5 248.8 382.4Q248.8 380.2 247.8 377.4Q246.8 374.5 246.8 371.9Q246.8 369.2 246.2 368.9Q245.8 368.5 245.8 364.9Q245.8 361.2 245.2 360.9Q244.8 360.5 244.8 345.4Q244.8 330.2 245.2 329.9Q245.8 329.5 245.8 326.4Q245.8 323.2 246.2 322.9Q246.8 322.5 247.8 315.4Q248.8 308.2 249.2 307.9Q249.8 307.5 249.8 305.9Q249.8 304.2 250.2 303.9Q250.8 303.5 250.8 301.9Q250.8 300.2 251.2 299.9Q251.8 299.5 251.8 297.9Q251.8 296.2 252.2 295.9Q252.8 295.5 252.8 293.9Q252.8 292.2 253.2 291.9Q253.8 291.5 253.8 289.9Q253.8 288.2 254.8 285.9Q255.8 283.5 256.8 276.4Q257.8 269.2 258.2 268.9Q258.8 268.5 259.2 259.4Q259.8 250.2 260.2 249.9Q260.8 249.5 260.2 240.9Q259.8 232.2 258.2 228.4Q256.8 224.5 256.8 220.9Q256.8 217.2 255.2 214.9Q253.8 212.5 253.8 211.4Q253.8 210.2 252.2 206.9Q250.8 203.5 250.8 197.9Q250.8 192.2 248.2 186.4Q245.8 180.5 245.8 177.9Q245.8 175.2 242.8 169.4Q239.8 163.5 239.2 156.9Q238.8 150.2 237.8 148.9Q236.8 147.5 236.2 144.4Q235.8 141.2 233.8 138.4Q231.8 135.5 231.2 132.9Q230.8 130.2 229.8 129.4Q228.8 128.5 227.2 124.4Q225.8 120.2 223.8 118.4Q221.8 116.5 221.8 115.9Q221.8 115.2 211.1 104.6Q200.5 94.0 198.4 93.0Q196.2 92.0 192.4 88.5Z";
const MATHILDA_HAUT = "M197.9 128.5Q195.5 126.0 191.4 126.0Q187.2 126.0 182.9 122.0Q178.5 118.0 174.5 115.5Q170.5 113.0 168.4 113.0Q166.2 113.0 165.9 112.5Q165.5 112.0 150.9 112.0Q136.2 112.0 133.8 113.0Q131.2 114.0 118.6 126.6Q106.0 139.2 105.5 143.4Q105.0 147.5 104.0 148.4Q103.0 149.2 103.0 151.4Q103.0 153.5 102.0 155.4Q101.0 157.2 101.0 159.4Q101.0 161.5 100.5 161.9Q100.0 162.2 100.0 164.4Q100.0 166.5 99.0 169.4Q98.0 172.2 98.0 201.4Q98.0 230.5 98.5 230.9Q99.0 231.2 99.0 232.9Q99.0 234.5 100.0 236.9Q101.0 239.2 101.0 244.4Q101.0 249.5 107.5 255.9Q114.0 262.2 114.5 266.4Q115.0 270.5 114.2 271.2Q113.5 272.0 111.9 272.0Q110.2 272.0 109.6 272.6Q109.0 273.2 109.0 275.4Q109.0 277.5 111.5 278.9Q114.0 280.2 114.0 290.4Q114.0 300.5 116.1 302.6Q118.2 304.8 119.4 304.8Q120.5 304.8 121.1 304.1Q121.8 303.5 121.8 301.4Q121.8 299.2 122.5 298.5Q123.2 297.8 125.9 297.8Q128.5 297.8 129.2 299.1Q130.0 300.5 131.5 301.4Q133.0 302.2 133.0 302.9Q133.0 303.5 129.8 306.8Q126.5 310.0 124.9 310.0Q123.2 310.0 122.6 310.6Q122.0 311.2 122.0 316.9Q122.0 322.5 119.2 324.8Q116.5 327.0 114.9 327.0Q113.2 327.0 102.9 337.5Q92.5 348.0 89.4 348.0Q86.2 348.0 83.9 345.5Q81.5 343.0 74.4 339.5Q67.2 336.0 65.4 333.5Q63.5 331.0 56.9 331.0Q50.2 331.0 49.9 331.5Q49.5 332.0 44.9 332.5Q40.2 333.0 38.9 334.0Q37.5 335.0 34.9 335.5Q32.2 336.0 29.9 338.5Q27.5 341.0 26.4 341.0Q25.2 341.0 22.9 343.5Q20.5 346.0 19.9 346.0Q19.2 346.0 14.1 351.1Q9.0 356.2 9.0 358.4Q9.0 360.5 6.5 362.9Q4.0 365.2 4.0 366.4Q4.0 367.5 2.8 368.8Q1.5 370.0 0.8 370.0Q0.0 370.0 0.0 404.9Q0.0 439.8 105.9 439.8Q211.8 439.8 211.8 386.0Q211.8 332.2 212.2 331.9Q212.8 331.5 212.8 329.9Q212.8 328.2 214.2 326.9Q215.8 325.5 215.8 316.9Q215.8 308.2 218.8 304.9Q221.8 301.5 222.8 297.9Q223.8 294.2 225.8 291.4Q227.8 288.5 227.8 286.4Q227.8 284.2 228.8 283.4Q229.8 282.5 229.8 275.4Q229.8 268.2 233.2 264.9Q236.8 261.5 237.2 256.4Q237.8 251.2 238.2 250.9Q238.8 250.5 238.8 243.4Q238.8 236.2 239.2 235.9Q239.8 235.5 239.8 233.4Q239.8 231.2 240.8 229.9Q241.8 228.5 242.2 216.4Q242.8 204.2 239.2 202.4Q235.8 200.5 235.2 196.4Q234.8 192.2 234.2 191.9Q233.8 191.5 233.8 188.9Q233.8 186.2 233.2 185.9Q232.8 185.5 232.8 182.9Q232.8 180.2 232.2 179.9Q231.8 179.5 231.8 176.9Q231.8 174.2 231.2 173.9Q230.8 173.5 230.8 170.9Q230.8 168.2 229.2 164.8Q227.8 161.2 226.8 160.4Q225.8 159.5 222.2 152.9Q218.8 146.2 214.1 141.6Q209.5 137.0 208.9 137.0Q208.2 137.0 205.4 134.0Q202.5 131.0 201.4 131.0Q200.2 131.0 197.9 128.5Z";
const MATHILDA_SCHATTEN = "M136.4 397.0Q135.2 397.0 134.6 398.2Q134.0 399.5 136.2 400.6Q138.5 401.8 139.1 400.5Q139.8 399.2 138.6 398.1Q137.5 397.0 136.4 397.0ZM120.4 384.5Q119.2 384.0 118.1 385.2Q117.0 386.5 118.6 388.6Q120.2 390.8 121.4 391.2Q122.5 391.8 123.6 390.5Q124.8 389.2 123.1 387.1Q121.5 385.0 120.4 384.5ZM106.9 373.5Q105.2 373.0 104.1 374.1Q103.0 375.2 103.5 376.2Q104.0 377.2 104.0 382.4Q104.0 387.5 104.5 387.9Q105.0 388.2 105.0 390.4Q105.0 392.5 105.6 393.6Q106.2 394.8 108.0 394.1Q109.8 393.5 111.2 390.5Q112.8 387.5 112.8 384.9Q112.8 382.2 112.2 381.9Q111.8 381.5 111.8 379.4Q111.8 377.2 110.1 375.6Q108.5 374.0 106.9 373.5ZM200.4 365.5Q198.2 365.0 197.6 365.6Q197.0 366.2 197.0 367.9Q197.0 369.5 198.5 370.9Q200.0 372.2 200.5 374.9Q201.0 377.5 205.1 382.1Q209.2 386.8 210.4 386.8Q211.5 386.8 211.6 381.0Q211.8 375.2 210.8 373.2Q209.8 371.2 206.1 368.6Q202.5 366.0 200.4 365.5ZM108.9 345.0Q108.2 345.0 107.6 345.6Q107.0 346.2 107.0 347.9Q107.0 349.5 108.0 352.0Q109.0 354.5 115.1 361.1Q121.2 367.8 122.2 368.2Q123.2 368.8 125.0 367.6Q126.8 366.5 126.8 364.9Q126.8 363.2 123.5 362.1Q120.2 361.0 117.5 357.8Q114.8 354.5 113.8 351.4Q112.8 348.2 111.1 346.6Q109.5 345.0 108.9 345.0ZM78.6 343.5Q78.8 342.2 76.6 340.6Q74.5 339.0 71.9 338.0Q69.2 337.0 65.9 334.0Q62.5 331.0 56.4 331.0Q50.2 331.0 49.9 331.5Q49.5 332.0 44.9 332.5Q40.2 333.0 38.9 334.0Q37.5 335.0 34.4 336.0Q31.2 337.0 29.9 338.5Q28.5 340.0 26.4 341.0Q24.2 342.0 17.1 348.6Q10.0 355.2 9.0 358.4Q8.0 361.5 6.0 363.9Q4.0 366.2 3.5 368.9Q3.0 371.5 5.1 374.1Q7.2 376.8 10.9 376.2Q14.5 375.8 18.1 371.1Q21.8 366.5 21.8 365.9Q21.8 365.2 25.5 361.5Q29.2 357.8 32.9 356.2Q36.5 354.8 41.4 350.8Q46.2 346.8 48.9 346.8Q51.5 346.8 53.4 345.8Q55.2 344.8 56.2 345.2Q57.2 345.8 60.4 345.8Q63.5 345.8 64.9 344.8Q66.2 343.8 67.9 343.8Q69.5 343.8 69.9 343.2Q70.2 342.8 74.4 343.8Q78.5 344.8 78.6 343.5ZM112.4 329.0Q111.2 329.0 110.6 329.6Q110.0 330.2 110.0 332.4Q110.0 334.5 114.2 338.1Q118.5 341.8 119.6 340.6Q120.8 339.5 119.8 337.4Q118.8 335.2 116.1 332.1Q113.5 329.0 112.4 329.0ZM124.4 269.0Q123.2 269.0 122.6 269.6Q122.0 270.2 122.5 273.9Q123.0 277.5 124.0 279.5Q125.0 281.5 130.0 286.4Q135.0 291.2 135.5 294.4Q136.0 297.5 135.0 300.0Q134.0 302.5 130.8 305.8Q127.5 309.0 125.9 309.5Q124.2 310.0 123.1 311.1Q122.0 312.2 122.0 315.4Q122.0 318.5 123.1 319.6Q124.2 320.8 127.9 321.2Q131.5 321.8 133.2 323.5Q135.0 325.2 135.0 326.4Q135.0 327.5 135.6 328.1Q136.2 328.8 137.4 328.8Q138.5 328.8 139.1 328.1Q139.8 327.5 139.2 323.9Q138.8 320.2 140.8 317.4Q142.8 314.5 142.8 313.4Q142.8 312.2 144.2 308.9Q145.8 305.5 145.8 303.9Q145.8 302.2 146.2 301.9Q146.8 301.5 146.8 298.9Q146.8 296.2 145.8 294.9Q144.8 293.5 144.2 290.4Q143.8 287.2 141.8 284.9Q139.8 282.5 138.8 279.9Q137.8 277.2 136.2 275.9Q134.8 274.5 134.8 273.9Q134.8 273.2 133.1 272.1Q131.5 271.0 129.9 271.0Q128.2 271.0 126.9 270.0Q125.5 269.0 124.4 269.0ZM220.8 252.4Q220.8 251.2 219.0 251.1Q217.2 251.0 214.4 253.0Q211.5 255.0 208.4 255.5Q205.2 256.0 199.9 259.5Q194.5 263.0 190.4 263.5Q186.2 264.0 181.9 267.0Q177.5 270.0 170.9 270.0Q164.2 270.0 163.1 270.6Q162.0 271.2 162.0 271.9Q162.0 272.5 163.1 273.6Q164.2 274.8 169.9 275.2Q175.5 275.8 175.9 275.2Q176.2 274.8 180.9 274.2Q185.5 273.8 188.9 271.2Q192.2 268.8 195.4 268.2Q198.5 267.8 199.2 268.5Q200.0 269.2 199.5 271.4Q199.0 273.5 200.2 274.1Q201.5 274.8 203.1 273.1Q204.8 271.5 204.8 268.4Q204.8 265.2 207.0 262.5Q209.2 259.8 212.4 259.2Q215.5 258.8 218.1 256.1Q220.8 253.5 220.8 252.4ZM179.1 242.1Q177.0 243.2 177.0 244.4Q177.0 245.5 178.1 246.6Q179.2 247.8 182.4 247.8Q185.5 247.8 187.1 247.1Q188.8 246.5 188.8 244.9Q188.8 243.2 187.1 242.1Q185.5 241.0 183.4 241.0Q181.2 241.0 179.1 242.1ZM174.9 209.5Q173.2 209.0 171.6 211.1Q170.0 213.2 170.5 214.9Q171.0 216.5 171.8 216.6Q172.5 216.8 174.2 219.0Q176.0 221.2 175.5 224.4Q175.0 227.5 174.0 229.5Q173.0 231.5 173.6 232.1Q174.2 232.8 176.9 232.8Q179.5 232.8 179.9 232.2Q180.2 231.8 181.4 231.8Q182.5 231.8 183.6 230.6Q184.8 229.5 184.8 228.4Q184.8 227.2 183.8 225.9Q182.8 224.5 182.8 222.9Q182.8 221.2 179.6 215.6Q176.5 210.0 174.9 209.5ZM158.6 201.0Q158.8 200.2 157.1 199.1Q155.5 198.0 151.4 197.5Q147.2 197.0 143.9 198.5Q140.5 200.0 136.9 200.0Q133.2 200.0 132.9 200.5Q132.5 201.0 131.4 201.0Q130.2 201.0 125.1 205.6Q120.0 210.2 120.0 212.4Q120.0 214.5 121.1 215.6Q122.2 216.8 123.9 216.8Q125.5 216.8 127.4 215.8Q129.2 214.8 133.9 215.2Q138.5 215.8 140.1 214.1Q141.8 212.5 141.8 210.9Q141.8 209.2 143.0 207.5Q144.2 205.8 145.4 205.8Q146.5 205.8 147.9 207.2Q149.2 208.8 150.9 208.8Q152.5 208.8 153.6 206.0Q154.8 203.2 155.5 202.5Q156.2 201.8 157.4 201.8Q158.5 201.8 158.6 201.0ZM144.8 186.4Q144.8 185.2 144.1 184.6Q143.5 184.0 136.4 184.5Q129.2 185.0 128.1 185.6Q127.0 186.2 127.0 187.4Q127.0 188.5 134.8 188.6Q142.5 188.8 143.6 188.1Q144.8 187.5 144.8 186.4ZM212.1 174.6Q210.5 173.0 208.4 173.0Q206.2 173.0 205.9 172.5Q205.5 172.0 202.4 172.5Q199.2 173.0 194.8 176.0Q190.2 179.0 186.6 182.6Q183.0 186.2 182.5 187.2Q182.0 188.2 182.0 192.4Q182.0 196.5 185.6 201.6Q189.2 206.8 190.4 206.8Q191.5 206.8 192.1 206.1Q192.8 205.5 192.8 201.4Q192.8 197.2 191.8 195.9Q190.8 194.5 190.8 193.4Q190.8 192.2 192.1 192.0Q193.5 191.8 194.9 192.8Q196.2 193.8 199.4 193.2Q202.5 192.8 203.6 191.6Q204.8 190.5 203.8 188.0Q202.8 185.5 203.2 184.4Q203.8 183.2 205.0 182.5Q206.2 181.8 208.9 182.2Q211.5 182.8 213.1 181.1Q214.8 179.5 214.2 177.9Q213.8 176.2 212.1 174.6ZM197.6 163.0Q199.8 160.2 198.6 159.1Q197.5 158.0 194.9 158.5Q192.2 159.0 186.1 164.1Q180.0 169.2 180.0 170.4Q180.0 171.5 181.2 172.1Q182.5 172.8 186.5 170.8Q190.5 168.8 191.4 167.8Q192.2 166.8 193.9 166.2Q195.5 165.8 197.6 163.0ZM206.4 135.0Q203.2 133.0 204.6 139.2Q206.0 145.5 210.0 148.4Q214.0 151.2 215.0 153.9Q216.0 156.5 217.5 157.9Q219.0 159.2 222.0 163.9Q225.0 168.5 226.6 170.1Q228.2 171.8 228.9 171.8Q229.5 171.8 230.1 171.1Q230.8 170.5 230.2 167.9Q229.8 165.2 227.8 162.4Q225.8 159.5 225.2 157.9Q224.8 156.2 223.8 155.4Q222.8 154.5 222.2 152.9Q221.8 151.2 220.8 150.4Q219.8 149.5 219.2 147.9Q218.8 146.2 214.1 141.6Q209.5 137.0 206.4 135.0ZM166.1 115.1Q165.0 116.2 165.0 116.9Q165.0 117.5 168.6 121.1Q172.2 124.8 176.9 125.8Q181.5 126.8 183.9 128.2Q186.2 129.8 187.5 129.6Q188.8 129.5 188.8 128.9Q188.8 128.2 187.1 126.6Q185.5 125.0 183.9 124.5Q182.2 124.0 180.4 122.0Q178.5 120.0 176.9 119.5Q175.2 119.0 172.4 116.5Q169.5 114.0 168.4 114.0Q167.2 114.0 166.1 115.1Z";
const MATHILDA_KONTUR1 = "M188.5 85.0 L183.5 82.5Q178.5 80.0 175.4 80.0Q172.2 80.0 169.9 82.0Q167.5 84.0 163.4 84.5Q159.2 85.0 158.9 85.5Q158.5 86.0 145.9 86.5Q133.2 87.0 132.9 86.5Q132.5 86.0 128.4 85.5Q124.2 85.0 122.4 83.5Q120.5 82.0 117.9 82.0Q115.2 82.0 112.4 83.5Q109.5 85.0 104.9 85.5Q100.2 86.0 97.2 87.0Q94.2 88.0 89.1 93.1Q84.0 98.2 78.0 107.2Q72.0 116.2 71.0 121.9Q70.0 127.5 72.0 131.4Q74.0 135.2 74.0 139.4Q74.0 143.5 72.0 149.4Q70.0 155.2 70.0 175.9Q70.0 196.5 69.0 198.4Q68.0 200.2 67.5 203.4Q67.0 206.5 66.0 208.5Q65.0 210.5 63.5 211.9Q62.0 213.2 62.0 216.9Q62.0 220.5 63.0 222.4Q64.0 224.2 64.0 242.4Q64.0 260.5 64.5 260.9Q65.0 261.2 65.0 264.4Q65.0 267.5 66.0 269.4Q67.0 271.2 67.0 274.4Q67.0 277.5 68.0 279.4Q69.0 281.2 69.0 293.9Q69.0 306.5 66.5 312.0Q64.0 317.5 59.2 322.8Q54.5 328.0 47.4 330.0Q40.2 332.0 38.9 333.0Q37.5 334.0 36.4 334.0Q35.2 334.0 34.4 335.0Q33.5 336.0 31.9 336.0Q30.2 336.0 24.9 341.0Q19.5 346.0 18.9 346.0Q18.2 346.0 12.9 351.5Q7.5 357.0 3.8 357.0 L0.0 357.0 M249.8 389.5 L249.8 387.4Q249.8 385.2 249.2 384.9Q248.8 384.5 248.8 382.4Q248.8 380.2 247.8 377.4Q246.8 374.5 246.8 371.9Q246.8 369.2 246.2 368.9Q245.8 368.5 245.8 364.9Q245.8 361.2 245.2 360.9Q244.8 360.5 244.8 345.4Q244.8 330.2 245.2 329.9Q245.8 329.5 245.8 326.4Q245.8 323.2 246.2 322.9Q246.8 322.5 247.8 315.4Q248.8 308.2 249.2 307.9Q249.8 307.5 249.8 305.9 L249.8 304.2 M250.8 192.2 L248.2 186.4Q245.8 180.5 245.8 177.9Q245.8 175.2 242.8 169.4Q239.8 163.5 239.2 156.9Q238.8 150.2 237.8 148.9Q236.8 147.5 236.2 144.4Q235.8 141.2 233.8 138.4Q231.8 135.5 231.2 132.9Q230.8 130.2 229.8 129.4Q228.8 128.5 227.2 124.4Q225.8 120.2 223.8 118.4Q221.8 116.5 221.8 115.9Q221.8 115.2 211.1 104.6Q200.5 94.0 198.4 93.0 L196.2 92.0";
const MATHILDA_KONTUR2 = "M117.0 379.0 L120.5 383.0Q124.0 387.0 126.5 388.0Q129.0 389.0 140.0 398.0Q151.0 407.0 152.0 406.5 L153.0 406.0 M91.0 356.0 L91.0 357.0Q91.0 358.0 101.5 368.0Q112.0 378.0 112.5 380.0 L113.0 382.0 M103.0 350.0 L110.5 359.5Q118.0 369.0 126.5 377.5Q135.0 386.0 140.5 389.0Q146.0 392.0 147.5 394.5Q149.0 397.0 153.0 399.5 L157.0 402.0 M115.0 268.0 L115.5 269.5Q116.0 271.0 114.5 271.5Q113.0 272.0 114.5 274.0Q116.0 276.0 114.5 277.5Q113.0 279.0 113.5 282.5Q114.0 286.0 115.5 281.5Q117.0 277.0 118.5 276.5Q120.0 276.0 123.0 280.5Q126.0 285.0 125.0 285.5Q124.0 286.0 124.0 288.0Q124.0 290.0 125.5 293.0 L127.0 296.0 M221.0 245.0 L217.0 248.5Q213.0 252.0 208.0 253.5Q203.0 255.0 200.5 257.5Q198.0 260.0 202.0 257.5 L206.0 255.0 M176.0 206.0 L184.0 220.0Q192.0 234.0 196.0 234.5Q200.0 235.0 200.0 233.5 L200.0 232.0 M182.0 202.0 L185.0 206.0Q188.0 210.0 190.0 210.0Q192.0 210.0 195.0 213.5Q198.0 217.0 198.5 220.5Q199.0 224.0 199.0 219.5 L199.0 215.0 M137.0 194.0 L130.0 198.5Q123.0 203.0 122.0 205.5Q121.0 208.0 128.5 202.0 L136.0 196.0 M135.0 182.0 L132.5 183.0Q130.0 184.0 125.0 184.0Q120.0 184.0 116.5 185.5Q113.0 187.0 112.0 188.5Q111.0 190.0 116.0 187.5Q121.0 185.0 126.0 185.0 L131.0 185.0 M200.0 171.0 L194.0 175.0Q188.0 179.0 194.5 175.5 L201.0 172.0 M193.0 139.0 L195.5 140.0Q198.0 141.0 203.0 147.0Q208.0 153.0 201.5 154.5Q195.0 156.0 187.0 162.5Q179.0 169.0 187.5 163.0Q196.0 157.0 202.5 155.5Q209.0 154.0 210.0 156.0Q211.0 158.0 221.5 167.5 L232.0 177.0 M170.0 113.0 L171.5 115.0Q173.0 117.0 185.0 125.5 L197.0 134.0 M182.0 202.0 L185.0 206.0Q188.0 210.0 190.5 210.0 L193.0 210.0 M171.0 198.0 L176.5 207.0Q182.0 216.0 183.5 220.5Q185.0 225.0 189.0 229.5 L193.0 234.0";
const MATHILDA_PUNKTE = [[162.2,114.3,0.65],[163.8,114.8,0.68],[170.4,115.2,0.59],[162.3,120.9,0.56],[181.9,123.9,0.63],[175.0,126.9,0.62],[176.1,125.3,0.64],[189.2,130.0,0.73],[111.8,142.2,0.54],[204.7,140.8,0.66],[207.3,145.9,0.61],[171.2,154.9,0.55],[212.8,156.3,0.60],[199.9,159.9,0.59],[180.0,168.3,0.64],[194.5,175.1,0.66],[229.8,173.8,0.75],[192.3,177.3,0.68],[216.3,176.9,0.57],[136.9,183.4,0.57],[143.9,183.2,0.62],[203.7,183.2,0.61],[210.7,181.9,0.60],[122.3,186.7,0.66],[125.2,185.8,0.72],[114.8,188.9,0.60],[119.6,189.4,0.67],[128.1,189.1,0.69],[132.7,189.8,0.64],[134.5,189.7,0.60],[113.6,191.8,0.59],[193.0,191.2,0.67],[205.1,192.9,0.66],[223.1,193.0,0.63],[146.3,194.0,0.61],[149.5,195.7,0.67],[154.0,195.5,0.60],[201.6,194.2,0.52],[219.4,195.1,0.61],[223.1,195.3,0.62],[105.9,197.9,0.62],[135.1,198.8,0.61],[138.7,199.0,0.64],[159.3,198.9,0.58],[157.9,200.1,0.62],[196.1,201.9,0.57],[215.6,200.6,0.60],[206.2,203.7,0.57],[216.7,204.3,0.60],[191.8,206.8,0.59],[209.9,206.1,0.60],[153.2,208.8,0.55],[165.7,208.9,0.57],[167.0,210.9,0.56],[169.9,210.8,0.59],[177.8,210.4,0.56],[213.6,210.0,0.61],[167.2,212.4,0.58],[119.8,215.6,0.68],[125.0,216.0,0.68],[132.6,215.2,0.61],[174.5,224.8,0.59],[144.0,227.7,0.53],[172.2,228.0,0.56],[207.8,228.8,0.69],[212.3,230.4,0.62],[216.5,231.9,0.58],[140.0,234.8,0.62],[143.7,234.2,0.59],[167.6,233.8,0.55],[174.2,235.1,0.58],[216.4,233.1,0.59],[226.1,233.7,0.57],[141.4,237.4,0.62],[198.0,236.6,0.56],[225.3,237.3,0.64],[166.0,239.1,0.58],[168.5,240.2,0.60],[182.0,240.5,0.57],[168.0,242.4,0.54],[177.1,246.7,0.62],[189.8,245.1,0.61],[218.0,248.1,0.60],[221.3,251.8,0.65],[218.2,254.8,0.68],[111.2,257.3,0.70],[216.7,256.9,0.64],[114.2,264.3,0.75],[117.6,267.4,0.62],[122.9,266.3,0.66],[129.0,267.4,0.57],[128.0,270.1,0.66],[135.9,270.5,0.61],[138.9,270.2,0.55],[135.6,273.0,0.66],[136.9,272.0,0.58],[158.2,273.0,0.60],[162.1,272.8,0.72],[185.5,272.9,0.67],[196.0,273.5,0.61],[197.7,273.1,0.70],[136.8,275.3,0.60],[170.2,275.8,0.61],[172.9,275.1,0.60],[177.0,274.9,0.59],[179.9,275.8,0.58],[185.8,275.8,0.57],[190.1,275.3,0.60],[191.9,275.2,0.61],[197.1,274.9,0.61],[114.7,278.9,0.58],[141.8,282.3,0.65],[145.9,290.0,0.52],[145.9,292.9,0.61],[146.5,306.3,0.54],[164.5,306.8,0.54],[143.6,309.4,0.70],[213.7,309.0,0.57],[143.2,312.5,0.66],[183.5,310.9,0.58],[209.4,312.8,0.67],[208.0,315.6,0.62],[209.7,314.0,0.60],[214.1,314.1,0.65],[140.1,317.0,0.65],[206.2,318.3,0.56],[212.4,319.1,0.56],[123.1,320.8,0.63],[206.0,321.8,0.58],[208.9,322.1,0.57],[128.9,323.3,0.61],[129.8,327.2,0.57],[141.1,326.9,0.60],[146.6,327.0,0.54],[118.2,332.6,0.62],[145.0,333.5,0.56],[65.0,345.5,0.64],[69.0,345.3,0.66],[72.6,344.5,0.62],[74.6,345.6,0.69],[80.0,344.5,0.61],[104.2,345.6,0.63],[44.2,347.5,0.68],[48.1,348.1,0.64],[51.8,347.5,0.61],[62.4,348.7,0.62],[65.1,348.1,0.60],[70.9,347.3,0.59],[116.2,346.8,0.53],[138.1,347.0,0.55],[140.4,348.7,0.59],[40.9,350.8,0.62],[60.6,351.7,0.61],[114.3,352.0,0.65],[39.4,355.2,0.60],[65.6,354.1,0.59],[117.2,354.1,0.60],[123.5,355.0,0.65],[126.4,353.7,0.59],[151.0,353.2,0.64],[153.8,353.6,0.62],[32.4,358.2,0.61],[35.4,356.3,0.60],[86.5,358.1,0.53],[111.0,356.4,0.61],[115.9,356.4,0.68],[124.0,356.2,0.65],[148.9,357.6,0.63],[152.3,357.8,0.63],[160.1,357.1,0.67],[161.1,356.7,0.70],[167.1,356.1,0.68],[170.6,358.0,0.61],[173.3,358.1,0.55],[70.9,359.6,0.63],[93.1,359.9,0.65],[123.2,361.0,0.66],[154.1,360.8,0.56],[158.3,358.9,0.58],[165.9,359.1,0.67],[168.9,360.7,0.66],[183.1,359.9,0.54],[23.7,362.6,0.68],[27.2,364.2,0.61],[71.1,363.0,0.62],[91.1,362.9,0.65],[93.1,363.9,0.71],[167.8,363.8,0.63],[174.9,362.7,0.62],[23.5,366.0,0.61],[69.4,366.9,0.62],[74.3,365.7,0.58],[92.0,365.6,0.64],[94.9,366.1,0.67],[195.9,365.7,0.59],[20.3,369.8,0.65],[25.9,368.6,0.55],[69.8,368.2,0.52],[71.7,369.0,0.61],[98.0,370.1,0.62],[122.9,369.6,0.64],[127.8,369.0,0.62],[3.2,372.9,0.70],[17.7,371.0,0.65],[73.0,372.1,0.54],[95.4,371.9,0.59],[101.5,373.2,0.64],[105.1,371.3,0.67],[132.1,372.3,0.66],[14.3,373.9,0.70],[8.3,377.2,0.64],[12.0,377.7,0.61],[131.2,377.4,0.62],[135.5,377.6,0.61]];

export function MathildaBild({ groesse = 220, style, className }) {
  return (
    <svg viewBox="0 0 320 440" width={groesse} height={Math.round(groesse * 440 / 320)} className={className} style={style}
      aria-label="Mathilda" role="img">
      <path fill={GOLD} fillRule="evenodd" d={MATHILDA_HAAR} />
      <path fill={"#FFFFFF"} fillRule="evenodd" d={MATHILDA_HAUT} />
      <path fill={NACHT} fillRule="evenodd" d={MATHILDA_SCHATTEN} />
      <path fill="none" stroke={NACHT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d={MATHILDA_KONTUR1} />
      <path fill="none" stroke={NACHT} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" d={MATHILDA_KONTUR2} />
      <g fill={NACHT}>{MATHILDA_PUNKTE.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} />)}</g>
    </svg>
  );
}

/* Kleines rundes Icon (Menü, Kacheln): Mathilda im Kreis */
export function MathildaIcon({ groesse = 40, hintergrund = NACHT, style }) {
  return (
    <span style={{ display: "inline-flex", width: groesse, height: groesse, borderRadius: 999, background: hintergrund, overflow: "hidden",
      alignItems: "flex-end", justifyContent: "center", flex: "none", ...style }}>
      <MathildaBild groesse={groesse * 0.92} style={{ display: "block", marginBottom: -groesse * 0.06 }} />
    </span>
  );
}

export const MODI = [
  { id: "blatt", name: "Blatt prüfen", kurz: "Dein Rechenweg, Zeile für Zeile" },
  { id: "weg", name: "Weg prüfen", kurz: "Vom Papier in den Editor" },
  { id: "aufgabe", name: "Aufgabe scannen", kurz: "Drei neue derselben Sorte" },
  { id: "chat", name: "Mathilda fragen", kurz: "Sie fragt zurück, bevor sie verrät" },
];

function ModusGlyph({ id, aktiv }) {
  const f = aktiv ? GOLD : "#8FA3CC";
  const s = { width: 26, height: 26, flex: "none" };
  if (id === "blatt") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 3h10l4 4v16H6z"/><path d="M16 3v4h4"/><path d="M9 12h8M9 16h6"/><path d="M9 20l2 2 4-4"/>
    </svg>);
  if (id === "weg") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h8M4 13h8M4 19h8"/><path d="M15 13h7"/><path d="M19 9l3 4-3 4"/>
    </svg>);
  if (id === "aufgabe") return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9V5h4M18 5h4v4M22 17v4h-4M8 21H4v-4"/><path d="M9 13h8"/><path d="M13 9v8"/>
    </svg>);
  return (
    <svg viewBox="0 0 26 26" style={s} fill="none" stroke={f} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6h18v11H11l-5 4v-4H4z"/><path d="M9 11.5h.01M13 11.5h.01M17 11.5h.01"/>
    </svg>);
}

/* Briefkasten mit Brief – Symbol der Box „Klausurbriefkasten“ */
function BriefkastenMini() {
  return (
    <svg viewBox="0 0 64 64" width="44" height="44" aria-hidden="true" style={{ display: "block", flex: "none" }}>
      <defs><linearGradient id="mk-bk-gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F8D23A" /><stop offset="0.55" stopColor={GOLD} /><stop offset="1" stopColor="#D9A600" /></linearGradient></defs>
      <rect x="29" y="40" width="6" height="20" rx="2" fill="#0A1636" />
      <path d="M12 26c0-9 7-15 16-15h14c8 0 12 6 12 14v18H12z" fill="url(#mk-bk-gold)" />
      <rect x="21" y="27" width="22" height="4" rx="2" fill={NACHT} />
      <path d="M24 6l12-2 2 13-12 2z" fill="#FFFFFF" />
      <path d="M26.5 9.5l8-1.3M27 13l8-1.3" stroke="#004D98" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 17v-8h7v5h-7" fill="#004D98" />
      <rect x="49" y="9" width="2" height="18" rx="1" fill="#0A1636" />
    </svg>
  );
}

/* Kopfbereich: Titel dicht am Header, Zweizeiler, goldener Scan-Knopf, rechts Mathilda; darunter die vier Modi */
export function MathildaKopf({ modus, setModus, onScan, onText, onBriefkasten }) {
  return (
    <div className="mathilda-kopf" style={{ background: `radial-gradient(120% 90% at 85% 10%, #163A7A 0%, ${C.see} 35%, ${NACHT} 85%)`, position: "relative", overflow: "hidden" }}>
      <style>{`
        .mathilda-kopf .mk-innen { max-width: 760px; margin: 0 auto; padding: 14px 24px 0; display: grid; grid-template-columns: 1fr auto; gap: 0 18px; align-items: end; }
        .mathilda-kopf .mk-text { align-self: end; padding-top: 26px; padding-bottom: 0; }
        .mathilda-kopf .mk-portraet { position: relative; align-self: end; animation: mk-auf 0.9s cubic-bezier(.2,.8,.2,1) both; margin-right: calc((min(760px, 100vw) - 78px) / 12); }
        .mathilda-kopf .mk-portraet svg { display: block; width: 196px; height: auto; position: relative; }
        .mathilda-kopf .mk-schein { position: absolute; inset: auto -10% 0 -10%; height: 70%; background: radial-gradient(60% 70% at 50% 100%, rgba(237,187,0,0.30), transparent 70%); pointer-events: none; }
        .mathilda-kopf .mk-scan { margin-top: 26px; vertical-align: bottom; display: inline-flex; align-items: center; gap: 12px; padding: 0 22px 0 8px; height: 58px; border: none; border-radius: 999px; cursor: pointer; font-family: inherit;
          color: ${NACHT}; font-size: 17px; font-weight: 800; letter-spacing: -0.01em; background: linear-gradient(135deg, #F8D23A 0%, ${GOLD} 55%, #D9A600 100%);
          box-shadow: 0 10px 30px rgba(237,187,0,0.40), inset 0 1px 0 rgba(255,255,255,0.55); transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; animation: mk-auf 0.9s 0.1s cubic-bezier(.2,.8,.2,1) both; }
        .mathilda-kopf .mk-scan:hover { transform: translateY(-2px); box-shadow: 0 14px 36px rgba(237,187,0,0.5), inset 0 1px 0 rgba(255,255,255,0.55); }
        .mathilda-kopf .mk-scan:active { transform: translateY(0); }
        .mathilda-kopf .mk-scan .mk-kam { width: 42px; height: 42px; border-radius: 999px; background: ${NACHT}; display: flex; align-items: center; justify-content: center; flex: none; }
        .mathilda-kopf .mk-modi { max-width: 760px; margin: 0 auto; padding: 18px 24px 26px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; border-top: 1px solid rgba(255,255,255,0.08); }
        .mathilda-kopf .mk-modus { text-align: left; border: 1.5px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.06); color: #DCE5F6; border-radius: 16px; padding: 12px 12px 11px; font-family: inherit; cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: transform .15s ease, background .15s ease, border-color .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-modus:hover { transform: translateY(-2px); background: rgba(255,255,255,0.1); }
        .mathilda-kopf .mk-modus[data-aktiv="1"] { background: #FFFFFF; color: ${NACHT}; border-color: #FFFFFF; box-shadow: 0 10px 26px rgba(5,12,40,0.35), inset 0 -4px 0 ${GOLD}; }
        .mathilda-kopf .mk-modus b { display: block; font-size: 14px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
        .mathilda-kopf .mk-modus span { display: block; font-size: 12px; font-weight: 400; line-height: 1.4; opacity: .85; }
        .mathilda-kopf .mk-duo { max-width: 760px; margin: 0 auto; padding: 0 24px 26px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-items: stretch; }
        .mathilda-kopf .mk-karte { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left; cursor: pointer; font-family: inherit; color: #FFFFFF; border-radius: 16px; padding: 14px 14px 12px; min-width: 0;
          transition: transform .15s ease, border-color .15s ease, background .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-karte:hover { transform: translateY(-2px); }
        .mathilda-kopf .mk-karte-text { border: 1.5px solid rgba(237,187,0,0.55); background: linear-gradient(135deg, rgba(237,187,0,0.16), rgba(255,255,255,0.04)); }
        .mathilda-kopf .mk-karte-text:hover { background: linear-gradient(135deg, rgba(237,187,0,0.24), rgba(255,255,255,0.06)); }
        .mathilda-kopf .mk-karte-bk { border: 1.5px solid rgba(255,255,255,0.16); background: linear-gradient(135deg, rgba(10,22,54,0.85), rgba(29,71,144,0.55)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08); }
        .mathilda-kopf .mk-karte-bk:hover { border-color: rgba(237,187,0,0.6); }
        .mathilda-kopf .mk-karte-kopf { display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 44px; }
        .mathilda-kopf .mk-karte b { display: block; font-size: 15px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.2; }
        .mathilda-kopf .mk-karte .mk-karte-ober { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #FFFFFF; }
        .mathilda-kopf .mk-karte .mk-karte-z { display: block; font-size: 12.5px; font-weight: 300; color: #C9D6EE; line-height: 1.45; flex: 1; }
        .mathilda-kopf .mk-karte .mk-tk-neu { font-size: 10px; font-weight: 800; letter-spacing: .12em; color: ${NACHT}; background: ${GOLD}; border-radius: 999px; padding: 3px 8px; flex: none; }
        .mathilda-kopf .mk-karte .mk-bk-schloss { display: inline-flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #E6EDF8; background: rgba(255,255,255,0.08); border-radius: 999px; padding: 3px 9px; }
        .mathilda-kopf .mk-ober { color: ${GOLD}; font-size: 14.4px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; margin-bottom: 8px; }
        .mathilda-kopf .mk-titel { font-weight: 700; font-size: 53px; letter-spacing: -0.03em; line-height: .98; margin: 0; }
        .mathilda-kopf .mk-satz { color: #C9D6EE; font-size: 18.6px; font-weight: 300; line-height: 1.5; margin-top: 14px; white-space: nowrap; }
        @keyframes mk-auf { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        @media (max-width: 560px) {
          .mathilda-kopf .mk-innen { grid-template-columns: 1fr 34vw; gap: 0 12px; padding-top: 20px; align-items: stretch; }
          .mathilda-kopf .mk-text { align-self: end; padding: 0; }
          .mathilda-kopf .mk-portraet { margin-right: 0; align-self: stretch; position: relative; }
          .mathilda-kopf .mk-portraet svg { position: absolute; left: calc(50% + 6px); right: auto; translate: -50% 0; bottom: 16px; height: calc(100% - 16px); width: auto; max-width: none; margin: 0; }
          .mathilda-kopf .mk-schein { display: none; }
          .mathilda-kopf .mk-ober { font-size: 11px; letter-spacing: .1em; margin-bottom: 8px; white-space: nowrap; }
          .mathilda-kopf .mk-titel { font-size: 36px; }
          .mathilda-kopf .mk-satz { font-size: 15.6px; line-height: 1.45; margin-top: 8px; white-space: normal; }
          .mathilda-kopf .mk-satz br { display: none; }
          .mathilda-kopf .mk-scan { margin-top: 16px; width: auto; max-width: 100%; white-space: nowrap; justify-content: flex-start; height: 44px; font-size: 13.5px; padding: 0 12px 0 5px; gap: 8px; box-shadow: 0 6px 18px rgba(237,187,0,0.35), inset 0 1px 0 rgba(255,255,255,0.55); }
          .mathilda-kopf .mk-scan .mk-kam { width: 34px; height: 34px; }
          .mathilda-kopf .mk-scan .mk-kam svg { width: 18px; height: 18px; }
          .mathilda-kopf .mk-modi { grid-template-columns: repeat(2, 1fr); padding-top: 16px; padding-bottom: 22px; }
        }
        @media (prefers-reduced-motion: reduce) { .mathilda-kopf .mk-portraet, .mathilda-kopf .mk-scan { animation: none; } }
      `}</style>
      <div className="mk-innen">
        <div className="mk-text">
          <p className="mk-ober">Deine Mathe-KI-Trainerin</p>
          <h1 className="titel-silber mk-titel">
            Mathilda<span style={{ color: GOLD }}>AI</span>
          </h1>
          <p className="mk-satz">
            Sie liest dein Blatt, nicht nur dein Ergebnis –<br />
            {" "}und zeigt dir den einen nächsten Schritt.
          </p>
          <button type="button" className="mk-scan" onClick={onScan}>
            <span className="mk-kam" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" />
              </svg>
            </span>
            Scan dein Blatt
          </button>
        </div>
        <div className="mk-portraet">
          <div className="mk-schein" />
          <MathildaBild groesse={196} style={{ display: "block" }} />
        </div>
      </div>
      <div className="mk-modi" role="tablist" aria-label="Was Mathilda tun soll">
        {MODI.map((x) => (
          <button key={x.id} type="button" role="tab" aria-selected={modus === x.id} data-aktiv={modus === x.id ? "1" : "0"}
            className="mk-modus" onClick={() => setModus(x.id)}>
            <ModusGlyph id={x.id} aktiv={modus === x.id} />
            <div><b>{x.name}</b><span>{x.kurz}</span></div>
          </button>
        ))}
      </div>
      {(onText || onBriefkasten) && (
        <div className="mk-duo">
          {onText && (
            <button type="button" className="mk-karte mk-karte-text" onClick={onText} data-mathilda-textaufgabe>
              <span className="mk-karte-kopf">
                <span className="mk-tk-neu">NEU</span>
                <span aria-hidden="true" style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
              </span>
              <b>Textaufgabe übersetzen</b>
              <span className="mk-karte-z">Foto rein – Bedingungen raus. Jede Stelle mit Begründung.</span>
            </button>
          )}
          {onBriefkasten && (
            <button type="button" className="mk-karte mk-karte-bk" onClick={onBriefkasten} data-mathilda-briefkasten>
              <span className="mk-karte-kopf">
                <BriefkastenMini />
                <span aria-hidden="true" style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
              </span>
              <span className="mk-karte-ober">Mathilda<span style={{ color: GOLD }}>AI</span></span>
              <b style={{ marginTop: -4 }}>Klausurbriefkasten</b>
              <span className="mk-karte-z">Wirf deine zurückgegebene Klassenarbeit ein – Mathilda baut daraus bessere Testklausuren.</span>
              <span className="mk-bk-schloss"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Foto wird nicht gespeichert</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* Illustration: Blatt auf dem Tisch, Handy flach darüber, goldener Suchrahmen – zeigt, wie das Foto entsteht */
export function FotoIllustration({ style }) {
  return (
    <svg viewBox="0 0 560 360" style={{ width: "100%", height: "auto", display: "block", ...style }} role="img" aria-label="So fotografierst du dein Blatt: Handy flach über dem Blatt">
      <style>{`
        .fi-handy { animation: fi-schweben 3.2s ease-in-out infinite; transform-origin: 280px 150px; }
        .fi-rahmen { animation: fi-puls 2.4s ease-in-out infinite; }
        .fi-blitz { animation: fi-blitz 3.2s ease-in-out infinite; }
        @keyframes fi-schweben { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
        @keyframes fi-puls { 0%,100% { opacity: .55; } 50% { opacity: 1; } }
        @keyframes fi-blitz { 0%,88%,100% { opacity: 0; } 92% { opacity: .9; } 96% { opacity: 0; } }
        @media (prefers-reduced-motion: reduce) { .fi-handy, .fi-rahmen, .fi-blitz { animation: none; } }
      `}</style>
      <defs>
        <linearGradient id="fi-tisch" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F3F6FB"/><stop offset="1" stopColor="#E8EFF9"/>
        </linearGradient>
        <filter id="fi-schatten" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#0F1A33" floodOpacity="0.22"/>
        </filter>
        <filter id="fi-schatten-blatt" x="-10%" y="-10%" width="120%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#0F1A33" floodOpacity="0.14"/>
        </filter>
      </defs>
      {/* Tisch */}
      <rect width="560" height="360" rx="24" fill="url(#fi-tisch)"/>
      {/* Blatt (Blanko, leicht gedreht) */}
      <g transform="rotate(-4 280 230)">
        <rect x="150" y="110" width="260" height="240" rx="6" fill="#FFFFFF" filter="url(#fi-schatten-blatt)"/>
        {/* Rechenweg mit schwarzem Stift */}
        <g fill="#1B1F2A" fontFamily="Caveat, 'Segoe Print', 'Bradley Hand', cursive" fontSize="30" fontWeight="600">
          <text x="176" y="156">f(x) = x² − 4x</text>
          <text x="176" y="198">f′(x) = 2x − 4</text>
          <text x="176" y="240">2x − 4 = 0</text>
          <text x="176" y="282">x = 2</text>
          <rect x="172" y="258" width="78" height="34" rx="4" fill="none" stroke="#1B1F2A" strokeWidth="2.4"/>
        </g>
      </g>
      {/* Stift */}
      <g transform="rotate(28 450 240)">
        <rect x="440" y="120" width="14" height="190" rx="6" fill="#1B1F2A"/>
        <path d="M440 310 l 7 22 l 7 -22 z" fill="#C7CDD6"/>
        <rect x="440" y="124" width="14" height="10" rx="3" fill="#C7CDD6"/>
      </g>
      {/* Suchrahmen auf dem Blatt */}
      <g className="fi-rahmen" fill="none" stroke={GOLD} strokeWidth="4" strokeLinecap="round">
        <path d="M166 128 v -18 h 18 M394 110 h 18 v 18 M412 318 v 18 h -18 M184 336 h -18 v -18"/>
      </g>
      {/* Handy flach darüber (von unten gesehen: Rückseite mit Kamera) */}
      <g className="fi-handy">
        <rect x="200" y="22" width="160" height="92" rx="18" fill={NACHT} filter="url(#fi-schatten)"/>
        <rect x="206" y="28" width="148" height="80" rx="14" fill="#16305F"/>
        <circle cx="236" cy="58" r="13" fill="#0A1430"/><circle cx="236" cy="58" r="7" fill="#2E58A8"/><circle cx="233" cy="55" r="2.2" fill="#FFFFFF" opacity=".85"/>
        <circle cx="266" cy="58" r="13" fill="#0A1430"/><circle cx="266" cy="58" r="7" fill="#2E58A8"/><circle cx="263" cy="55" r="2.2" fill="#FFFFFF" opacity=".85"/>
        <circle cx="251" cy="86" r="5" fill="#FFF3C4"/>
        <rect x="286" y="48" width="56" height="4" rx="2" fill="#2A4A86"/><rect x="286" y="60" width="40" height="4" rx="2" fill="#2A4A86"/>
        {/* Lichtkegel */}
        <path d="M212 112 L 160 116 L 160 330 L 418 330 L 418 116 L 348 112 Z" fill="#FFFFFF" opacity="0.35"/>
        <ellipse className="fi-blitz" cx="251" cy="86" rx="60" ry="22" fill="#FFF3C4" opacity="0"/>
      </g>
      {/* Hinweis: gerade von oben */}
      <g fill="none" stroke={C.see} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M72 60 v 200"/><path d="M64 68 l 8 -8 l 8 8"/><path d="M64 252 l 8 8 l 8 -8"/>
      </g>
      <text x="72" y="178" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.see} transform="rotate(-90 72 178)" fontFamily="inherit" letterSpacing="0.1em">GERADE VON OBEN</text>
    </svg>
  );
}

function SchrittIcon({ art }) {
  const p = { width: 22, height: 22, fill: "none", stroke: C.see, strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round" };
  if (art === "papier") return <svg viewBox="0 0 24 24" {...p}><path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4"/></svg>;
  if (art === "stift") return <svg viewBox="0 0 24 24" {...p}><path d="M4 20l4-1 11-11-3-3L5 16z"/><path d="M13 7l3 3"/></svg>;
  if (art === "licht") return <svg viewBox="0 0 24 24" {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/></svg>;
  return <svg viewBox="0 0 24 24" {...p}><rect x="7" y="2" width="10" height="20" rx="2.5"/><path d="M11 18h2"/></svg>;
}

/* Die Karte, die zum Foto führt: Illustration, drei Bedingungen, großer Knopf */
export function FotoStart({ onKamera, onGalerie, titel = "Blatt fotografieren", untertitel = "Kamera geht direkt auf.", blankoWarum = false }) {
  /* Karo, Linien und jeder Stift sind beim Foto erlaubt. Den Tipp zu Blankopapier und schwarzem Stift gibt Mathilda erst in der Antwort. */
  const schritte = [
    ["handy", "Handy flach über dem Blatt", "Nicht schräg, nicht von der Seite"],
    ["licht", "Gutes Licht", "Fenster oder Lampe, kein Schatten"],
  ];
  return (
    <section style={{ background: C.weiss, borderRadius: 24, boxShadow: "0 10px 40px rgba(15,26,51,0.10)", overflow: "hidden" }}>
      <style>{`
        .fs-knopf { position: relative; width: 100%; display: flex; align-items: center; gap: 14px; padding: 12px 20px 12px 12px; border: none; border-radius: 18px; text-align: left; cursor: pointer; font-family: inherit;
          color: ${NACHT}; background: linear-gradient(135deg, #F6CB2E 0%, ${GOLD} 55%, #D9A600 100%); box-shadow: 0 10px 28px rgba(237,187,0,0.38), inset 0 1px 0 rgba(255,255,255,0.5); transition: transform .15s ease, box-shadow .15s ease; -webkit-tap-highlight-color: transparent; }
        .fs-knopf:hover { transform: translateY(-2px); box-shadow: 0 14px 34px rgba(237,187,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5); }
        .fs-knopf:active { transform: translateY(0); }
        .fs-knopf .fs-kam { width: 64px; height: 64px; border-radius: 18px; background: ${NACHT}; display: flex; align-items: center; justify-content: center; flex: none; box-shadow: 0 4px 12px rgba(14,30,74,0.28); }
        .fs-knopf .fs-titel { display: block; font-size: 20px; font-weight: 800; letter-spacing: -0.015em; line-height: 1.15; white-space: nowrap; }
        .fs-knopf .fs-unter { display: block; font-size: 12.5px; font-weight: 500; line-height: 1.4; margin-top: 3px; opacity: 0.85; }
        .fs-schritte { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px 16px; }
        @media (max-width: 420px) { .fs-schritte { grid-template-columns: 1fr; } }
      `}</style>
      <FotoIllustration />
      <div style={{ padding: "22px 22px 24px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 12 }}>So klappt das Foto</p>
        <div className="fs-schritte">
          {schritte.map(([art, t, s]) => (
            <div key={art} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 36, height: 36, borderRadius: 12, background: C.himmel, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}><SchrittIcon art={art} /></span>
              <div>
                <p style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.3, color: C.tinte }}>{t}</p>
                <p style={{ fontSize: 12.5, color: C.grau, fontWeight: 300, lineHeight: 1.45, marginTop: 2 }}>{s}</p>
              </div>
            </div>
          ))}
        </div>
        <button type="button" className="fs-knopf" onClick={onKamera} style={{ marginTop: 22 }}>
          <span className="fs-kam" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke={GOLD} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>
            </svg>
          </span>
          <span style={{ minWidth: 0 }}>
            <span className="fs-titel">{titel}</span>
            <span className="fs-unter">{untertitel}</span>
          </span>
        </button>
        <button type="button" onClick={onGalerie}
          style={{ width: "100%", marginTop: 10, minHeight: 46, background: "transparent", border: `1.5px solid ${C.linie}`, borderRadius: 14, color: C.see, fontSize: 14, fontWeight: 600, fontFamily: "inherit", cursor: "pointer" }}>
          Foto aus der Galerie wählen
        </button>
        {blankoWarum && <BlankoWarum />}
      </div>
    </section>
  );
}

/* Kleiner Input unter dem Scan-Knopf: warum Blankopapier und schwarzer Stift besser zum Arbeiten sind (Konzept Pen & Paper),
   dazu ein Motion-Film in drei Szenen (Karo + blauer Stift → Blanko + schwarzer Stift → Mathilda liest sicher).
   Rein CSS: ein Zyklus von 16 s, jede Szene blendet über denselben Zeitplan ein und aus. Bei „weniger Bewegung“ steht das Schlussbild. */
const BW_BLAU = "#2E4FA8";
export function BlankoWarum() {
  return (
    <section aria-labelledby="bw-titel" style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${C.linie}` }}>
      <style>{`
        .bw-film { position: relative; border-radius: 18px; overflow: hidden; background: linear-gradient(160deg, ${NACHT} 0%, #163A7A 100%); padding: 14px 14px 12px; box-shadow: 0 8px 26px rgba(14,30,74,0.22); }
        .bw-buehne { position: relative; height: 196px; }
        .bw-chip { opacity: 0; position: absolute; left: 0; top: 0; z-index: 3; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; color: ${GOLD}; }
        .bw-blatt { position: absolute; left: 0; right: 0; top: 22px; bottom: 0; border-radius: 10px; overflow: hidden; opacity: 0; box-shadow: 0 10px 24px rgba(3,10,30,0.4); }
        .bw-karo { background-color: #F7FAFF; background-image: linear-gradient(#B9C9E4 1px, transparent 1px), linear-gradient(90deg, #B9C9E4 1px, transparent 1px); background-size: 24px 24px; background-position: 6px 4px; }
        .bw-blanko { background: #FFFFFF; }
        .bw-hand { z-index: 1; position: absolute; left: 18px; font-family: Caveat, 'Bradley Hand', cursive; font-weight: 600; white-space: nowrap; line-height: 1; }
        .bw-karo .bw-hand { color: ${BW_BLAU}; font-size: 30px; letter-spacing: 1.5px; }
        .bw-blanko .bw-hand { color: #0B0F1A; font-size: 31px; }
        .bw-z1 { top: 34px; } .bw-z2 { top: 108px; }
        .bw-bruch { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle; }
        .bw-bruch i { display: block; width: 100%; height: 2px; border-radius: 1px; background: currentColor; margin: 3px 0 2px; }
        .bw-karo .bw-bruch i { background: ${BW_BLAU}; height: 1.6px; }
        .bw-luft { display: inline-block; width: 22px; }
        .bw-eng { letter-spacing: -0.5px; }
        .bw-op { position: relative; display: inline-block; }
        .bw-op::before { content: ""; position: absolute; left: -9px; right: -9px; top: -5px; bottom: -3px; border-radius: 999px; background: rgba(237,187,0,.30); box-shadow: 0 0 0 1.5px rgba(237,187,0,.9); opacity: 0; z-index: -1; }
        .bw-scan { position: absolute; top: 0; bottom: 0; width: 3px; left: 0; z-index: 2; background: linear-gradient(${GOLD}, ${GOLD}); box-shadow: 0 0 14px 4px rgba(237,187,0,.55); opacity: 0; }
        .bw-mark { position: absolute; z-index: 2; width: 22px; height: 22px; border-radius: 999px; display: flex; align-items: center; justify-content: center; font-family: inherit; font-size: 13px; font-weight: 800; opacity: 0; }
        .bw-frage { background: #FFB020; color: #3A2500; box-shadow: 0 0 0 3px rgba(255,176,32,.28); }
        .bw-haken { background: #1F9D55; color: #fff; box-shadow: 0 0 0 3px rgba(31,157,85,.25); }
        .bw-unter { position: relative; height: 70px; margin-top: 12px; }
        .bw-unter p { position: absolute; inset: 0; margin: 0; color: #DCE5F6; font-size: 13.5px; font-weight: 400; line-height: 1.5; opacity: 0; }
        .bw-unter b { color: #fff; font-weight: 700; }
        .bw-punkte { display: flex; gap: 6px; justify-content: center; margin-top: 2px; }
        .bw-punkte i { width: 22px; height: 3px; border-radius: 2px; background: rgba(255,255,255,.2); position: relative; overflow: hidden; }
        .bw-punkte i::after { content: ""; position: absolute; inset: 0; background: ${GOLD}; transform: scaleX(0); transform-origin: left; }

        /* Zeitplan (16 s): A Karo 0–6 s · B Blanko 6–11 s · C Mathilda liest 11–16 s */
        .bw-film.laeuft .bw-A { animation: bwA 16s infinite both; }
        .bw-film.laeuft .bw-B { animation: bwB 16s infinite both; }
        .bw-film.laeuft .bw-schreib1 { animation: bwS1 16s infinite both; }
        .bw-film.laeuft .bw-schreib2 { animation: bwS2 16s infinite both; }
        .bw-film.laeuft .bw-schreibB1 { animation: bwSB1 16s infinite both; }
        .bw-film.laeuft .bw-schreibB2 { animation: bwSB2 16s infinite both; }
        .bw-film.laeuft .bw-op::before { animation: bwPille 16s infinite both; }
        .bw-film.laeuft .bw-scanA { animation: bwScanA 16s infinite both; }
        .bw-film.laeuft .bw-scanB { animation: bwScanB 16s infinite both; }
        .bw-film.laeuft .bw-frage { animation: bwFrage 16s infinite both; }
        .bw-film.laeuft .bw-haken { animation: bwHaken 16s infinite both; }
        .bw-film.laeuft .bw-c1 { animation: bwCap1 16s infinite both; }
        .bw-film.laeuft .bw-c2 { animation: bwCap2 16s infinite both; }
        .bw-film.laeuft .bw-c3 { animation: bwCap3 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(1)::after { animation: bwP1 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(2)::after { animation: bwP2 16s infinite both; }
        .bw-film.laeuft .bw-punkte i:nth-child(3)::after { animation: bwP3 16s infinite both; }
        @keyframes bwA { 0% { opacity: 0; transform: translateY(8px); } 3%, 36% { opacity: 1; transform: none; } 39%, 100% { opacity: 0; transform: translateY(-6px); } }
        @keyframes bwB { 0%, 37% { opacity: 0; transform: translateY(8px); } 41%, 96% { opacity: 1; transform: none; } 99%, 100% { opacity: 0; transform: translateY(-6px); } }
                @keyframes bwS1 { 0%, 4% { clip-path: inset(-20px 100% -20px -10px); } 14% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwS2 { 0%, 14% { clip-path: inset(-20px 100% -20px -10px); } 24% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwSB1 { 0%, 42% { clip-path: inset(-20px 100% -20px -10px); } 50% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwSB2 { 0%, 50% { clip-path: inset(-20px 100% -20px -10px); } 58% { clip-path: inset(-20px -20px -20px -10px); } 100% { clip-path: inset(-20px -20px -20px -10px); } }
        @keyframes bwPille { 0%, 58% { opacity: 0; transform: scale(.6); } 62%, 100% { opacity: 1; transform: none; } }
        @keyframes bwScanA { 0%, 26% { opacity: 0; left: 0; } 27% { opacity: 1; left: 0; } 33% { opacity: 1; left: calc(100% - 3px); } 34%, 100% { opacity: 0; left: calc(100% - 3px); } }
        @keyframes bwScanB { 0%, 72% { opacity: 0; left: 0; } 73% { opacity: 1; left: 0; } 80% { opacity: 1; left: calc(100% - 3px); } 81%, 100% { opacity: 0; left: calc(100% - 3px); } }
        @keyframes bwFrage { 0%, 30% { opacity: 0; transform: scale(.3); } 33%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes bwHaken { 0%, 77% { opacity: 0; transform: scale(.3); } 81%, 100% { opacity: 1; transform: scale(1); } }
        @keyframes bwCap1 { 0%, 3% { opacity: 0; } 6%, 35% { opacity: 1; } 38%, 100% { opacity: 0; } }
        @keyframes bwCap2 { 0%, 40% { opacity: 0; } 43%, 67% { opacity: 1; } 70%, 100% { opacity: 0; } }
        @keyframes bwCap3 { 0%, 72% { opacity: 0; } 75%, 96% { opacity: 1; } 99%, 100% { opacity: 0; } }
        @keyframes bwP1 { 0% { transform: scaleX(0); } 37% { transform: scaleX(1); } 38%, 100% { transform: scaleX(0); } }
        @keyframes bwP2 { 0%, 38% { transform: scaleX(0); } 69% { transform: scaleX(1); } 70%, 100% { transform: scaleX(0); } }
        @keyframes bwP3 { 0%, 70% { transform: scaleX(0); } 98% { transform: scaleX(1); } 100% { transform: scaleX(0); } }

        /* Weniger Bewegung: Schlussbild (Blanko, schwarzer Stift, sicher gelesen) steht still */
        .bw-film:not(.laeuft) .bw-B, .bw-film:not(.laeuft) .bw-c3 { opacity: 1; }
        .bw-film:not(.laeuft) .bw-op::before, .bw-film:not(.laeuft) .bw-haken, .bw-film:not(.laeuft) .bw-chip.bw-B { opacity: 1; }
        .bw-karten { display: grid; grid-template-columns: 1fr; gap: 12px; margin-top: 18px; }
        @media (min-width: 520px) { .bw-karten { grid-template-columns: 1fr 1fr; } }
        .bw-karte { border-radius: 16px; background: ${C.himmel}; padding: 16px 16px 15px; }
        .bw-karte h3 { margin: 10px 0 6px; font-size: 15.5px; font-weight: 700; letter-spacing: -0.01em; line-height: 1.3; color: ${C.tinte}; }
        .bw-karte p { margin: 0; font-size: 13.5px; font-weight: 300; line-height: 1.6; color: ${C.grau}; }
        .bw-karte p b { font-weight: 600; color: ${C.tinte}; }
      `}</style>
      <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.see, marginBottom: 8 }}>Tipp für dein nächstes Blatt</p>
      <h2 id="bw-titel" style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.25, marginBottom: 8, color: C.tinte }}>
        Warum Blankopapier und schwarzer Stift besser für dich sind
      </h2>
      <p style={{ color: C.grau, fontSize: 14.5, fontWeight: 300, lineHeight: 1.65, marginBottom: 16 }}>
        Dein Blatt ist der Arbeitsplatz deines Denkens. Je klarer es aussieht, desto leichter siehst du selbst, wo dein Weg bricht.
      </p>
      <BlankoFilm />
      <div className="bw-karten">
        <div className="bw-karte">
          <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.see} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 3h10l4 4v14H5z" /><path d="M15 3v4h4" /></svg>
          </span>
          <h3>Blankopapier: du bestimmst den Abstand</h3>
          <p>Karo steckt jedes Zeichen in dieselbe Box. Beim Rechnen soll aber <b>Nähe zeigen, was zusammengehört</b>: eng im Term, Luft um Plus und Minus. Dazu ein Schritt pro Zeile, Gleichheitszeichen untereinander.</p>
        </div>
        <div className="bw-karte">
          <span aria-hidden="true" style={{ width: 34, height: 34, borderRadius: 11, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={C.see} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 7l3 3" /></svg>
          </span>
          <h3>Schwarzer Stift: klar und ehrlich</h3>
          <p>Schwarz hat den stärksten Kontrast, auch im Foto. Ohne Radierer streichst du Fehler <b>sichtbar durch</b>, statt sie wegzuwischen. So kannst du deinen Weg morgen noch nachvollziehen.</p>
        </div>
      </div>
      <p style={{ color: C.grau, fontSize: 13.5, fontWeight: 300, lineHeight: 1.65, marginTop: 14 }}>
        Du musst nichts umstellen: Mathilda liest auch Karo und jeden Stift. Probier Blanko und Schwarz einfach beim nächsten Blatt aus.
      </p>
    </section>
  );
}

/* Der Film selbst: Bühne mit drei Szenen, Untertitel und Fortschrittsbalken */
function BlankoFilm() {
  const [laeuft, setLaeuft] = React.useState(true);
  React.useEffect(() => {
    let mq; try { mq = window.matchMedia("(prefers-reduced-motion: reduce)"); } catch { return undefined; }
    const f = () => setLaeuft(!mq.matches);
    f();
    mq.addEventListener ? mq.addEventListener("change", f) : mq.addListener(f);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", f) : mq.removeListener(f));
  }, []);
  return (
    <div className={laeuft ? "bw-film laeuft" : "bw-film"} role="img"
      aria-label="Kurzfilm: Dieselbe Rechnung auf Karopapier mit blauem Stift und auf Blankopapier mit schwarzem Stift. Auf Karo kreuzen Linien die Zeichen, auf Blanko bekommen Plus und Minus Platz und Mathilda liest jede Zeile sicher.">
      <div className="bw-buehne" aria-hidden="true">
        {/* Szene A: Karo, blauer Stift */}
        <span className="bw-chip bw-A">Karo · blauer Stift</span>
        <div className="bw-blatt bw-karo bw-A">
          <div className="bw-hand bw-z1 bw-schreib1">3x² − 4x + 2</div>
          <div className="bw-hand bw-z2 bw-schreib2" style={{ top: 100 }}>
            <span className="bw-bruch"><span>x² − 4</span><i /><span>x − 2</span></span>
          </div>
          <span className="bw-scan bw-scanA" />
          <span className="bw-mark bw-frage" style={{ left: 106, top: 121 }}>?</span>
          <span className="bw-mark bw-frage" style={{ left: 63, top: 22 }}>?</span>
        </div>
        {/* Szene B und C: Blanko, schwarzer Stift – danach liest Mathilda sicher */}
        <span className="bw-chip bw-B">Blanko · schwarzer Stift</span>
        <div className="bw-blatt bw-blanko bw-B">
          <div className="bw-hand bw-z1 bw-schreibB1"><span className="bw-eng">3x²</span><span className="bw-luft" /><span className="bw-op">−</span><span className="bw-luft" /><span className="bw-eng">4x</span><span className="bw-luft" /><span className="bw-op">+</span><span className="bw-luft" />2</div>
          <div className="bw-hand bw-z2 bw-schreibB2" style={{ top: 100 }}>
            <span className="bw-bruch" style={{ padding: "0 6px" }}><span>x²<span className="bw-luft" style={{ width: 16 }} />−<span className="bw-luft" style={{ width: 16 }} />4</span><i /><span>x<span className="bw-luft" style={{ width: 16 }} />−<span className="bw-luft" style={{ width: 16 }} />2</span></span>
          </div>
          <span className="bw-scan bw-scanB" />
          <span className="bw-mark bw-haken" style={{ right: 14, top: 38 }}>✓</span>
          <span className="bw-mark bw-haken" style={{ right: 14, top: 122 }}>✓</span>
        </div>
      </div>
      <div className="bw-unter" aria-hidden="true">
        <p className="bw-c1"><b>Karo:</b> Linien laufen durch deine Zeichen, jedes bekommt gleich viel Platz. Strich oder Karo?</p>
        <p className="bw-c2"><b>Blanko:</b> Plus und Minus bekommen Platz, was zusammengehört, steht eng. So zeigt dein Blatt, wie du rechnest.</p>
        <p className="bw-c3"><b>Schwarz auf Weiß:</b> kräftiger Kontrast. So liest Mathilda jede Zeile sicher und kann dir genauer helfen.</p>
      </div>
      <div className="bw-punkte" aria-hidden="true"><i /><i /><i /></div>
    </div>
  );
}

/* Drei Schritte, wie Mathilda arbeitet – als kleine Zeitleiste */
export function SoArbeitetMathilda() {
  const schritte = [
    ["Du fotografierst", "Ein Foto von oben genügt. Schief, dunkel oder im falschen Format rechnet die App gerade."],
    ["Mathilda liest mit", "Zeile für Zeile. Sie zeigt dir zuerst, was sie gelesen hat, und erst danach, wo der Weg bricht."],
    ["Ein nächster Schritt", "Keine Notenliste, keine zwölf Vorschläge. Genau eine Sache, die du beim nächsten Blatt anders machst."],
  ];
  return (
    <div style={{ position: "relative", paddingLeft: 4 }}>
      {schritte.map(([t, s], i) => (
        <div key={i} style={{ display: "flex", gap: 16, paddingBottom: i < schritte.length - 1 ? 22 : 0, position: "relative" }}>
          {i < schritte.length - 1 && <span aria-hidden="true" style={{ position: "absolute", left: 15, top: 32, bottom: 0, width: 2, background: `linear-gradient(${GOLD}, ${C.linie})` }} />}
          <span style={{ width: 32, height: 32, borderRadius: 999, background: NACHT, color: GOLD, fontSize: 14, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", position: "relative" }}>{i + 1}</span>
          <div>
            <p style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em", marginBottom: 4, color: C.tinte }}>{t}</p>
            <p style={{ color: C.grau, fontSize: 14, fontWeight: 300, lineHeight: 1.65 }}>{s}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
