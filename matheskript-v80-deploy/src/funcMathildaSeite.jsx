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
const MATHILDA_HAAR = "M192.4 88.5Q188.5 85.0 187.4 85.0Q186.2 85.0 185.4 84.0Q184.5 83.0 182.4 82.5Q180.2 82.0 179.4 81.0Q178.5 80.0 175.4 80.0Q172.2 80.0 169.4 83.0Q166.5 86.0 145.9 86.5Q125.2 87.0 122.9 84.5Q120.5 82.0 117.9 82.0Q115.2 82.0 114.4 83.0Q113.5 84.0 112.4 84.0Q111.2 84.0 110.9 84.5Q110.5 85.0 105.4 85.5Q100.2 86.0 99.4 87.0Q98.5 88.0 96.4 88.0Q94.2 88.0 89.1 93.1Q84.0 98.2 78.0 107.2Q72.0 116.2 71.0 121.9Q70.0 127.5 72.0 129.4Q74.0 131.2 74.0 138.4Q74.0 145.5 73.0 146.4Q72.0 147.2 72.0 149.9Q72.0 152.5 71.0 153.9Q70.0 155.2 70.0 177.4Q70.0 199.5 69.0 199.9Q68.0 200.2 68.0 203.4Q68.0 206.5 65.0 209.9Q62.0 213.2 62.0 216.9Q62.0 220.5 63.0 221.4Q64.0 222.2 64.0 241.4Q64.0 260.5 64.5 260.9Q65.0 261.2 65.0 264.4Q65.0 267.5 66.0 267.9Q67.0 268.2 67.0 272.9Q67.0 277.5 68.0 277.9Q69.0 278.2 69.0 292.4Q69.0 306.5 66.5 312.0Q64.0 317.5 62.5 318.9Q61.0 320.2 60.5 321.9Q60.0 323.5 57.2 326.2Q54.5 329.0 48.9 330.0Q43.2 331.0 40.4 332.5Q37.5 334.0 36.4 334.0Q35.2 334.0 34.4 335.0Q33.5 336.0 31.9 336.0Q30.2 336.0 24.9 341.0Q19.5 346.0 18.9 346.0Q18.2 346.0 12.9 351.5Q7.5 357.0 3.8 357.0Q0.0 357.0 0.0 398.4Q0.0 439.8 147.4 439.8Q294.8 439.8 294.8 422.5Q294.8 405.2 293.2 403.9Q291.8 402.5 291.2 399.4Q290.8 396.2 289.8 395.4Q288.8 394.5 288.8 383.4Q288.8 372.2 286.8 370.4Q284.8 368.5 284.2 364.4Q283.8 360.2 282.8 359.4Q281.8 358.5 281.8 338.4Q281.8 318.2 282.8 317.4Q283.8 316.5 283.8 314.9Q283.8 313.2 285.2 311.4Q286.8 309.5 286.8 295.9Q286.8 282.2 285.0 282.1Q283.2 282.0 281.5 280.2Q279.8 278.5 279.2 274.4Q278.8 270.2 277.8 269.4Q276.8 268.5 276.8 266.9Q276.8 265.2 274.8 263.4Q272.8 261.5 272.8 259.4Q272.8 257.2 269.8 253.4Q266.8 249.5 266.8 247.4Q266.8 245.2 265.2 243.9Q263.8 242.5 263.8 240.4Q263.8 238.2 262.8 236.9Q261.8 235.5 261.8 233.9Q261.8 232.2 260.5 232.1Q259.2 232.0 259.0 230.1Q258.8 228.2 257.8 227.9Q256.8 227.5 256.8 222.4Q256.8 217.2 255.8 216.9Q254.8 216.5 254.8 214.9Q254.8 213.2 253.8 212.9Q252.8 212.5 252.8 209.9Q252.8 207.2 251.8 206.4Q250.8 205.5 250.8 198.9Q250.8 192.2 249.8 190.9Q248.8 189.5 248.8 187.9Q248.8 186.2 247.2 184.9Q245.8 183.5 245.8 179.4Q245.8 175.2 244.2 173.9Q242.8 172.5 242.8 170.9Q242.8 169.2 241.8 168.4Q240.8 167.5 240.8 165.9Q240.8 164.2 240.2 163.9Q239.8 163.5 239.2 156.9Q238.8 150.2 237.2 148.4Q235.8 146.5 235.8 143.9Q235.8 141.2 234.2 139.9Q232.8 138.5 232.8 137.4Q232.8 136.2 231.8 135.4Q230.8 134.5 230.8 132.4Q230.8 130.2 229.2 128.9Q227.8 127.5 227.2 124.9Q226.8 122.2 224.2 119.4Q221.8 116.5 221.8 115.9Q221.8 115.2 211.1 104.6Q200.5 94.0 198.4 93.0Q196.2 92.0 192.4 88.5Z";
const MATHILDA_HAUT = "M271.9 348.0Q270.2 348.0 269.6 348.6Q269.0 349.2 269.0 394.5Q269.0 439.8 278.9 439.8Q288.8 439.8 288.8 424.0Q288.8 408.2 286.8 406.4Q284.8 404.5 284.8 402.9Q284.8 401.2 283.8 400.4Q282.8 399.5 282.8 379.9Q282.8 360.2 281.8 359.4Q280.8 358.5 280.8 356.9Q280.8 355.2 277.1 351.6Q273.5 348.0 271.9 348.0ZM214.6 137.1Q208.5 131.0 207.5 130.5Q206.5 130.0 203.4 130.5Q200.2 131.0 197.9 128.5Q195.5 126.0 191.4 126.0Q187.2 126.0 182.9 122.0Q178.5 118.0 174.5 115.5Q170.5 113.0 168.4 113.0Q166.2 113.0 165.9 112.5Q165.5 112.0 150.9 112.0Q136.2 112.0 133.8 113.0Q131.2 114.0 118.6 126.6Q106.0 139.2 105.5 143.4Q105.0 147.5 104.0 148.4Q103.0 149.2 103.0 151.4Q103.0 153.5 102.0 155.4Q101.0 157.2 101.0 159.4Q101.0 161.5 100.5 161.9Q100.0 162.2 100.0 164.4Q100.0 166.5 99.0 169.4Q98.0 172.2 98.0 201.4Q98.0 230.5 98.5 230.9Q99.0 231.2 99.0 232.9Q99.0 234.5 100.0 236.9Q101.0 239.2 101.0 244.4Q101.0 249.5 107.5 255.9Q114.0 262.2 114.5 266.4Q115.0 270.5 114.2 271.2Q113.5 272.0 111.9 272.0Q110.2 272.0 109.6 272.6Q109.0 273.2 109.0 275.4Q109.0 277.5 111.5 278.9Q114.0 280.2 114.0 290.4Q114.0 300.5 116.1 302.6Q118.2 304.8 119.4 304.8Q120.5 304.8 121.1 304.1Q121.8 303.5 121.8 301.4Q121.8 299.2 122.5 298.5Q123.2 297.8 125.9 297.8Q128.5 297.8 129.2 299.1Q130.0 300.5 131.5 301.4Q133.0 302.2 133.0 302.9Q133.0 303.5 129.8 306.8Q126.5 310.0 124.9 310.0Q123.2 310.0 122.6 310.6Q122.0 311.2 122.0 316.9Q122.0 322.5 119.2 324.8Q116.5 327.0 114.9 327.0Q113.2 327.0 102.9 337.5Q92.5 348.0 89.4 348.0Q86.2 348.0 83.9 345.5Q81.5 343.0 74.4 339.5Q67.2 336.0 65.4 333.5Q63.5 331.0 56.9 331.0Q50.2 331.0 49.9 331.5Q49.5 332.0 44.9 332.5Q40.2 333.0 38.9 334.0Q37.5 335.0 34.9 335.5Q32.2 336.0 29.9 338.5Q27.5 341.0 26.4 341.0Q25.2 341.0 22.9 343.5Q20.5 346.0 19.9 346.0Q19.2 346.0 14.1 351.1Q9.0 356.2 9.0 358.4Q9.0 360.5 6.5 362.9Q4.0 365.2 4.0 366.4Q4.0 367.5 2.8 368.8Q1.5 370.0 0.8 370.0Q0.0 370.0 0.0 404.9Q0.0 439.8 105.9 439.8Q211.8 439.8 211.8 386.0Q211.8 332.2 212.2 331.9Q212.8 331.5 212.8 329.9Q212.8 328.2 214.2 326.9Q215.8 325.5 215.8 316.9Q215.8 308.2 218.8 304.9Q221.8 301.5 222.8 297.9Q223.8 294.2 225.8 291.4Q227.8 288.5 227.8 286.4Q227.8 284.2 228.8 283.4Q229.8 282.5 229.8 275.4Q229.8 268.2 233.2 264.9Q236.8 261.5 237.2 256.4Q237.8 251.2 238.2 250.9Q238.8 250.5 238.8 243.4Q238.8 236.2 239.2 235.9Q239.8 235.5 239.8 233.4Q239.8 231.2 240.8 229.9Q241.8 228.5 242.2 215.4Q242.8 202.2 242.2 201.9Q241.8 201.5 241.8 198.9Q241.8 196.2 240.8 194.9Q239.8 193.5 239.8 191.4Q239.8 189.2 238.8 188.4Q237.8 187.5 237.8 185.9Q237.8 184.2 236.2 182.4Q234.8 180.5 234.8 177.9Q234.8 175.2 236.2 173.4Q237.8 171.5 237.8 166.9Q237.8 162.2 230.8 155.4Q223.8 148.5 222.2 145.9Q220.8 143.2 214.6 137.1Z";
const MATHILDA_SCHATTEN = "M136.4 397.0Q135.2 397.0 134.6 398.2Q134.0 399.5 136.2 400.6Q138.5 401.8 139.1 400.5Q139.8 399.2 138.6 398.1Q137.5 397.0 136.4 397.0ZM120.4 384.5Q119.2 384.0 118.1 385.2Q117.0 386.5 118.6 388.6Q120.2 390.8 121.4 391.2Q122.5 391.8 123.6 390.5Q124.8 389.2 123.1 387.1Q121.5 385.0 120.4 384.5ZM106.9 373.5Q105.2 373.0 104.1 374.1Q103.0 375.2 103.5 376.2Q104.0 377.2 104.0 382.4Q104.0 387.5 104.5 387.9Q105.0 388.2 105.0 390.4Q105.0 392.5 105.6 393.6Q106.2 394.8 108.0 394.1Q109.8 393.5 111.2 390.5Q112.8 387.5 112.8 384.9Q112.8 382.2 112.2 381.9Q111.8 381.5 111.8 379.4Q111.8 377.2 110.1 375.6Q108.5 374.0 106.9 373.5ZM200.4 365.5Q198.2 365.0 197.6 365.6Q197.0 366.2 197.0 367.9Q197.0 369.5 198.5 370.9Q200.0 372.2 200.5 374.9Q201.0 377.5 205.1 382.1Q209.2 386.8 210.4 386.8Q211.5 386.8 211.6 381.0Q211.8 375.2 210.8 373.2Q209.8 371.2 206.1 368.6Q202.5 366.0 200.4 365.5ZM274.8 361.5Q271.2 359.0 270.1 359.6Q269.0 360.2 269.0 400.0Q269.0 439.8 278.9 439.8Q288.8 439.8 288.8 424.5Q288.8 409.2 287.2 407.4Q285.8 405.5 284.2 402.0Q282.8 398.5 282.8 382.4Q282.8 366.2 281.6 365.1Q280.5 364.0 279.4 364.0Q278.2 364.0 274.8 361.5ZM108.9 345.0Q108.2 345.0 107.6 345.6Q107.0 346.2 107.0 347.9Q107.0 349.5 108.0 352.0Q109.0 354.5 115.1 361.1Q121.2 367.8 122.2 368.2Q123.2 368.8 125.0 367.6Q126.8 366.5 126.8 364.9Q126.8 363.2 123.5 362.1Q120.2 361.0 117.5 357.8Q114.8 354.5 113.8 351.4Q112.8 348.2 111.1 346.6Q109.5 345.0 108.9 345.0ZM78.6 343.5Q78.8 342.2 76.6 340.6Q74.5 339.0 71.9 338.0Q69.2 337.0 65.9 334.0Q62.5 331.0 56.4 331.0Q50.2 331.0 49.9 331.5Q49.5 332.0 44.9 332.5Q40.2 333.0 38.9 334.0Q37.5 335.0 34.4 336.0Q31.2 337.0 29.9 338.5Q28.5 340.0 26.4 341.0Q24.2 342.0 17.1 348.6Q10.0 355.2 9.0 358.4Q8.0 361.5 6.0 363.9Q4.0 366.2 3.5 368.9Q3.0 371.5 5.1 374.1Q7.2 376.8 10.9 376.2Q14.5 375.8 18.1 371.1Q21.8 366.5 21.8 365.9Q21.8 365.2 25.5 361.5Q29.2 357.8 32.9 356.2Q36.5 354.8 41.4 350.8Q46.2 346.8 48.9 346.8Q51.5 346.8 53.4 345.8Q55.2 344.8 56.2 345.2Q57.2 345.8 60.4 345.8Q63.5 345.8 64.9 344.8Q66.2 343.8 67.9 343.8Q69.5 343.8 69.9 343.2Q70.2 342.8 74.4 343.8Q78.5 344.8 78.6 343.5ZM112.4 329.0Q111.2 329.0 110.6 329.6Q110.0 330.2 110.0 332.4Q110.0 334.5 114.2 338.1Q118.5 341.8 119.6 340.6Q120.8 339.5 119.8 337.4Q118.8 335.2 116.1 332.1Q113.5 329.0 112.4 329.0ZM124.4 269.0Q123.2 269.0 122.6 269.6Q122.0 270.2 122.5 273.9Q123.0 277.5 124.0 279.5Q125.0 281.5 130.0 286.4Q135.0 291.2 135.5 294.4Q136.0 297.5 135.0 300.0Q134.0 302.5 130.8 305.8Q127.5 309.0 125.9 309.5Q124.2 310.0 123.1 311.1Q122.0 312.2 122.0 315.4Q122.0 318.5 123.1 319.6Q124.2 320.8 127.9 321.2Q131.5 321.8 133.2 323.5Q135.0 325.2 135.0 326.4Q135.0 327.5 135.6 328.1Q136.2 328.8 137.4 328.8Q138.5 328.8 139.1 328.1Q139.8 327.5 139.2 323.9Q138.8 320.2 140.8 317.4Q142.8 314.5 142.8 313.4Q142.8 312.2 144.2 308.9Q145.8 305.5 145.8 303.9Q145.8 302.2 146.2 301.9Q146.8 301.5 146.8 298.9Q146.8 296.2 145.8 294.9Q144.8 293.5 144.2 290.4Q143.8 287.2 141.8 284.9Q139.8 282.5 138.8 279.9Q137.8 277.2 136.2 275.9Q134.8 274.5 134.8 273.9Q134.8 273.2 133.1 272.1Q131.5 271.0 129.9 271.0Q128.2 271.0 126.9 270.0Q125.5 269.0 124.4 269.0ZM220.8 252.4Q220.8 251.2 219.0 251.1Q217.2 251.0 214.4 253.0Q211.5 255.0 208.4 255.5Q205.2 256.0 199.9 259.5Q194.5 263.0 190.4 263.5Q186.2 264.0 181.9 267.0Q177.5 270.0 170.9 270.0Q164.2 270.0 163.1 270.6Q162.0 271.2 162.0 271.9Q162.0 272.5 163.1 273.6Q164.2 274.8 169.9 275.2Q175.5 275.8 175.9 275.2Q176.2 274.8 180.9 274.2Q185.5 273.8 188.9 271.2Q192.2 268.8 195.4 268.2Q198.5 267.8 199.2 268.5Q200.0 269.2 199.5 271.4Q199.0 273.5 200.2 274.1Q201.5 274.8 203.1 273.1Q204.8 271.5 204.8 268.4Q204.8 265.2 207.0 262.5Q209.2 259.8 212.4 259.2Q215.5 258.8 218.1 256.1Q220.8 253.5 220.8 252.4ZM176.0 213.1Q175.2 213.0 174.6 213.6Q174.0 214.2 174.5 215.4Q175.0 216.5 176.0 216.9Q177.0 217.2 177.0 218.4Q177.0 219.5 177.6 220.1Q178.2 220.8 178.9 220.8Q179.5 220.8 179.6 220.0Q179.8 219.2 178.2 217.4Q176.8 215.5 176.8 214.4Q176.8 213.2 176.0 213.1ZM151.8 200.9Q151.8 199.2 150.6 198.1Q149.5 197.0 148.4 197.0Q147.2 197.0 143.9 198.5Q140.5 200.0 136.9 200.0Q133.2 200.0 132.9 200.5Q132.5 201.0 131.4 201.0Q130.2 201.0 125.1 205.6Q120.0 210.2 120.0 212.4Q120.0 214.5 121.1 215.6Q122.2 216.8 123.9 216.8Q125.5 216.8 127.4 215.8Q129.2 214.8 133.9 215.2Q138.5 215.8 140.1 214.1Q141.8 212.5 142.2 209.9Q142.8 207.2 144.0 206.0Q145.2 204.8 147.9 204.2Q150.5 203.8 151.1 203.1Q151.8 202.5 151.8 200.9ZM144.8 186.4Q144.8 185.2 144.1 184.6Q143.5 184.0 136.4 184.5Q129.2 185.0 128.1 185.6Q127.0 186.2 127.0 187.4Q127.0 188.5 134.8 188.6Q142.5 188.8 143.6 188.1Q144.8 187.5 144.8 186.4ZM212.1 174.6Q210.5 173.0 208.4 173.0Q206.2 173.0 205.9 172.5Q205.5 172.0 202.4 172.5Q199.2 173.0 194.8 176.0Q190.2 179.0 186.6 182.6Q183.0 186.2 182.5 187.2Q182.0 188.2 182.0 191.9Q182.0 195.5 186.1 200.6Q190.2 205.8 191.5 205.1Q192.8 204.5 192.8 200.9Q192.8 197.2 191.8 195.9Q190.8 194.5 190.8 193.4Q190.8 192.2 192.1 192.0Q193.5 191.8 194.9 192.8Q196.2 193.8 199.4 193.2Q202.5 192.8 203.6 191.6Q204.8 190.5 203.8 188.0Q202.8 185.5 203.2 184.4Q203.8 183.2 205.0 182.5Q206.2 181.8 208.9 182.2Q211.5 182.8 213.1 181.1Q214.8 179.5 214.2 177.9Q213.8 176.2 212.1 174.6ZM197.6 163.0Q199.8 160.2 198.6 159.1Q197.5 158.0 194.9 158.5Q192.2 159.0 186.1 164.1Q180.0 169.2 180.0 170.4Q180.0 171.5 181.2 172.1Q182.5 172.8 186.5 170.8Q190.5 168.8 191.4 167.8Q192.2 166.8 193.9 166.2Q195.5 165.8 197.6 163.0ZM205.9 130.5Q203.2 130.0 202.6 130.6Q202.0 131.2 202.0 132.4Q202.0 133.5 203.0 134.9Q204.0 136.2 205.0 140.9Q206.0 145.5 210.0 148.4Q214.0 151.2 215.0 153.9Q216.0 156.5 217.5 157.9Q219.0 159.2 222.0 163.9Q225.0 168.5 228.5 171.9Q232.0 175.2 232.1 176.0Q232.2 176.8 233.4 176.8Q234.5 176.8 236.1 174.1Q237.8 171.5 237.8 167.4Q237.8 163.2 237.2 162.2Q236.8 161.2 230.2 154.9Q223.8 148.5 222.2 145.9Q220.8 143.2 214.6 137.1Q208.5 131.0 205.9 130.5ZM166.1 115.1Q165.0 116.2 165.0 116.9Q165.0 117.5 168.6 121.1Q172.2 124.8 176.9 125.8Q181.5 126.8 183.9 128.2Q186.2 129.8 187.5 129.6Q188.8 129.5 188.8 128.9Q188.8 128.2 187.1 126.6Q185.5 125.0 183.9 124.5Q182.2 124.0 180.4 122.0Q178.5 120.0 176.9 119.5Q175.2 119.0 172.4 116.5Q169.5 114.0 168.4 114.0Q167.2 114.0 166.1 115.1Z";
const MATHILDA_KONTUR1 = "M188.5 85.0 L187.4 85.0Q186.2 85.0 182.4 82.5Q178.5 80.0 175.4 80.0Q172.2 80.0 169.4 83.0Q166.5 86.0 145.9 86.5Q125.2 87.0 122.9 84.5Q120.5 82.0 117.9 82.0Q115.2 82.0 114.4 83.0Q113.5 84.0 112.0 84.5Q110.5 85.0 105.4 85.5Q100.2 86.0 99.4 87.0Q98.5 88.0 96.4 88.0Q94.2 88.0 89.1 93.1Q84.0 98.2 78.0 107.2Q72.0 116.2 71.0 121.9Q70.0 127.5 72.0 129.4Q74.0 131.2 74.0 138.4Q74.0 145.5 73.0 146.4Q72.0 147.2 72.0 149.9Q72.0 152.5 71.0 153.9Q70.0 155.2 70.0 177.4Q70.0 199.5 69.0 199.9Q68.0 200.2 68.0 203.4Q68.0 206.5 65.0 209.9Q62.0 213.2 62.0 216.9Q62.0 220.5 63.0 221.4Q64.0 222.2 64.0 241.4Q64.0 260.5 64.5 260.9Q65.0 261.2 65.0 264.4Q65.0 267.5 66.0 267.9Q67.0 268.2 67.0 272.9Q67.0 277.5 68.0 277.9Q69.0 278.2 69.0 292.4Q69.0 306.5 66.5 312.0Q64.0 317.5 59.2 323.2Q54.5 329.0 48.9 330.0Q43.2 331.0 40.4 332.5Q37.5 334.0 36.4 334.0Q35.2 334.0 34.4 335.0Q33.5 336.0 31.9 336.0Q30.2 336.0 24.9 341.0Q19.5 346.0 18.9 346.0Q18.2 346.0 12.9 351.5Q7.5 357.0 3.8 357.0 L0.0 357.0 M294.8 439.8 L294.8 422.5Q294.8 405.2 293.2 403.9Q291.8 402.5 291.2 399.4Q290.8 396.2 289.8 395.4Q288.8 394.5 288.8 383.4Q288.8 372.2 286.8 370.4Q284.8 368.5 284.2 364.4Q283.8 360.2 282.8 359.4Q281.8 358.5 281.8 338.4Q281.8 318.2 282.8 317.4Q283.8 316.5 283.8 314.9Q283.8 313.2 285.2 311.4Q286.8 309.5 286.8 295.9Q286.8 282.2 285.0 282.1Q283.2 282.0 281.5 280.2Q279.8 278.5 279.2 274.4Q278.8 270.2 277.8 269.4Q276.8 268.5 276.8 266.9Q276.8 265.2 274.8 263.4Q272.8 261.5 272.8 259.4Q272.8 257.2 269.8 253.4Q266.8 249.5 266.8 247.4Q266.8 245.2 265.2 243.9Q263.8 242.5 263.8 240.4Q263.8 238.2 262.8 236.9Q261.8 235.5 261.8 233.9Q261.8 232.2 260.5 232.1Q259.2 232.0 259.0 230.1Q258.8 228.2 257.8 227.9Q256.8 227.5 256.8 222.4Q256.8 217.2 255.8 216.9Q254.8 216.5 254.8 214.9Q254.8 213.2 253.8 212.9Q252.8 212.5 252.8 209.9Q252.8 207.2 251.8 206.4Q250.8 205.5 250.8 198.9Q250.8 192.2 249.8 190.9Q248.8 189.5 248.8 187.9Q248.8 186.2 247.2 184.9Q245.8 183.5 245.8 179.4Q245.8 175.2 244.2 173.9Q242.8 172.5 242.8 170.9Q242.8 169.2 241.8 168.4Q240.8 167.5 240.8 165.9Q240.8 164.2 240.2 163.9Q239.8 163.5 239.2 156.9Q238.8 150.2 237.2 148.4Q235.8 146.5 235.8 143.9Q235.8 141.2 234.2 139.9Q232.8 138.5 232.8 137.4Q232.8 136.2 231.8 135.4Q230.8 134.5 230.8 132.4Q230.8 130.2 229.2 128.9Q227.8 127.5 227.2 124.9Q226.8 122.2 224.2 118.8Q221.8 115.2 211.1 104.6Q200.5 94.0 198.4 93.0 L196.2 92.0";
const MATHILDA_KONTUR2 = "M6.0 357.0 L3.0 360.5Q0.0 364.0 1.0 365.0Q2.0 366.0 1.5 368.0Q1.0 370.0 2.0 369.5 L3.0 369.0 M263.0 331.0 L271.5 340.0Q280.0 349.0 279.5 351.0Q279.0 353.0 280.5 355.0Q282.0 357.0 281.0 351.5 L280.0 346.0 M119.0 311.0 L117.0 313.5Q115.0 316.0 115.5 318.0Q116.0 320.0 116.0 318.5 L116.0 317.0 M94.0 307.0 L95.5 312.5Q97.0 318.0 98.0 318.0 L99.0 318.0 M114.0 301.0 L117.5 304.5Q121.0 308.0 124.0 308.0Q127.0 308.0 130.0 305.5 L133.0 303.0 M252.0 298.0 L251.5 299.5Q251.0 301.0 246.5 304.0Q242.0 307.0 241.0 309.5Q240.0 312.0 240.0 315.5Q240.0 319.0 245.5 328.0Q251.0 337.0 252.0 336.5Q253.0 336.0 250.5 333.0Q248.0 330.0 247.0 326.5Q246.0 323.0 243.5 320.5Q241.0 318.0 241.0 315.5 L241.0 313.0 M259.0 295.0 L259.0 302.0Q259.0 309.0 260.0 308.5Q261.0 308.0 260.0 305.5Q259.0 303.0 259.5 300.0Q260.0 297.0 261.0 298.0 L262.0 299.0 M69.0 291.0 L69.5 298.0Q70.0 305.0 72.5 314.0Q75.0 323.0 73.5 324.5Q72.0 326.0 66.5 326.0Q61.0 326.0 61.0 323.0Q61.0 320.0 58.5 324.0 L56.0 328.0 M234.0 286.0 L233.0 288.0Q232.0 290.0 232.5 295.0Q233.0 300.0 232.0 304.0Q231.0 308.0 232.0 309.0Q233.0 310.0 235.0 310.0 L237.0 310.0 M113.0 286.0 L113.0 288.5Q113.0 291.0 111.0 293.5Q109.0 296.0 106.0 295.5Q103.0 295.0 104.5 296.0 L106.0 297.0 M85.0 278.0 L84.0 279.0Q83.0 280.0 83.0 296.5Q83.0 313.0 84.0 314.0Q85.0 315.0 85.5 322.0Q86.0 329.0 90.0 333.5 L94.0 338.0 M73.0 274.0 L75.5 280.0Q78.0 286.0 77.0 293.5Q76.0 301.0 78.0 306.5Q80.0 312.0 80.5 310.5Q81.0 309.0 79.5 307.5 L78.0 306.0 M99.0 273.0 L97.0 273.5Q95.0 274.0 96.0 276.0Q97.0 278.0 101.5 278.5Q106.0 279.0 107.5 278.0 L109.0 277.0 M274.0 263.0 L276.5 271.5Q279.0 280.0 280.5 282.0Q282.0 284.0 282.0 286.0Q282.0 288.0 284.0 289.5Q286.0 291.0 285.0 296.0Q284.0 301.0 282.5 301.0Q281.0 301.0 281.5 303.0Q282.0 305.0 284.0 303.5 L286.0 302.0 M102.0 257.0 L99.5 258.5Q97.0 260.0 97.0 261.5Q97.0 263.0 100.0 260.5 L103.0 258.0 M264.0 256.0 L264.0 271.0Q264.0 286.0 265.5 292.0Q267.0 298.0 268.0 299.0Q269.0 300.0 269.0 302.5Q269.0 305.0 267.0 307.5Q265.0 310.0 266.5 317.5Q268.0 325.0 270.0 329.0Q272.0 333.0 274.5 334.0Q277.0 335.0 273.0 329.5Q269.0 324.0 268.0 317.5Q267.0 311.0 268.5 309.5 L270.0 308.0 M84.0 249.0 L85.5 256.0Q87.0 263.0 88.5 264.0Q90.0 265.0 89.5 268.5Q89.0 272.0 90.0 276.5Q91.0 281.0 94.0 287.0Q97.0 293.0 99.0 294.0 L101.0 295.0 M261.0 232.0 L263.0 239.5Q265.0 247.0 269.0 253.5Q273.0 260.0 273.0 258.5 L273.0 257.0 M242.0 199.0 L243.5 208.0Q245.0 217.0 245.5 215.0 L246.0 213.0 M246.0 184.0 L248.5 193.0Q251.0 202.0 251.0 198.5 L251.0 195.0 M75.0 175.0 L74.0 177.5Q73.0 180.0 73.0 196.0Q73.0 212.0 71.5 224.0Q70.0 236.0 72.0 243.5Q74.0 251.0 74.0 255.0Q74.0 259.0 75.5 262.5Q77.0 266.0 76.5 267.5 L76.0 269.0 M88.0 139.0 L83.5 161.5Q79.0 184.0 79.0 213.0Q79.0 242.0 80.5 244.5Q82.0 247.0 83.0 246.5 L84.0 246.0 M216.0 138.0 L220.0 143.5Q224.0 149.0 230.5 155.0 L237.0 161.0 M90.0 114.0 L89.5 117.0Q89.0 120.0 86.5 124.5Q84.0 129.0 82.5 137.5Q81.0 146.0 80.0 147.0Q79.0 148.0 77.5 159.0Q76.0 170.0 77.0 169.0 L78.0 168.0 M158.0 106.0 L160.0 108.5Q162.0 111.0 166.5 112.5Q171.0 114.0 171.5 112.5Q172.0 111.0 173.5 111.0Q175.0 111.0 188.0 121.0Q201.0 131.0 197.0 126.5 L193.0 122.0 M174.0 98.0 L185.5 106.5Q197.0 115.0 190.5 108.5 L184.0 102.0 M152.0 94.0 L149.0 95.0Q146.0 96.0 151.5 96.0Q157.0 96.0 163.0 98.5Q169.0 101.0 190.5 117.5Q212.0 134.0 204.5 126.5 L197.0 119.0 M106.0 90.0 L100.0 95.0Q94.0 100.0 89.5 106.0Q85.0 112.0 81.0 120.5Q77.0 129.0 73.5 144.5Q70.0 160.0 74.0 145.5 L78.0 131.0 M125.0 87.0 L126.0 88.5Q127.0 90.0 132.5 89.0Q138.0 88.0 135.0 87.5 L132.0 87.0 M159.0 86.0 L165.0 87.5Q171.0 89.0 179.5 94.5Q188.0 100.0 195.5 106.5Q203.0 113.0 211.5 123.0Q220.0 133.0 221.0 133.0 L222.0 133.0";
const MATHILDA_KONTUR3 = "M117.0 379.0 L120.5 383.0Q124.0 387.0 126.5 388.0Q129.0 389.0 140.0 398.0Q151.0 407.0 152.0 406.5 L153.0 406.0 M91.0 356.0 L91.0 357.0Q91.0 358.0 101.5 368.0Q112.0 378.0 112.5 380.0 L113.0 382.0 M103.0 350.0 L110.5 359.5Q118.0 369.0 126.5 377.5Q135.0 386.0 140.5 389.0Q146.0 392.0 147.5 394.5Q149.0 397.0 153.0 399.5 L157.0 402.0 M115.0 268.0 L115.5 269.5Q116.0 271.0 114.5 271.5Q113.0 272.0 114.5 274.0Q116.0 276.0 114.5 277.5Q113.0 279.0 113.5 282.5Q114.0 286.0 115.5 281.5Q117.0 277.0 118.5 276.5Q120.0 276.0 123.0 280.5Q126.0 285.0 125.0 285.5Q124.0 286.0 124.0 288.0Q124.0 290.0 125.5 293.0 L127.0 296.0 M221.0 245.0 L217.0 248.5Q213.0 252.0 208.0 253.5Q203.0 255.0 200.5 257.5Q198.0 260.0 202.0 257.5 L206.0 255.0 M176.0 206.0 L184.0 220.0Q192.0 234.0 196.0 234.5Q200.0 235.0 200.0 233.5 L200.0 232.0 M182.0 202.0 L185.0 206.0Q188.0 210.0 190.0 210.0Q192.0 210.0 195.0 213.5Q198.0 217.0 198.5 220.5Q199.0 224.0 199.0 219.5 L199.0 215.0 M137.0 194.0 L130.0 198.5Q123.0 203.0 122.0 205.5Q121.0 208.0 128.5 202.0 L136.0 196.0 M135.0 182.0 L132.5 183.0Q130.0 184.0 125.0 184.0Q120.0 184.0 116.5 185.5Q113.0 187.0 112.0 188.5Q111.0 190.0 116.0 187.5Q121.0 185.0 126.0 185.0 L131.0 185.0 M200.0 171.0 L194.0 175.0Q188.0 179.0 194.5 175.5 L201.0 172.0 M193.0 139.0 L195.5 140.0Q198.0 141.0 203.0 147.0Q208.0 153.0 201.5 154.5Q195.0 156.0 187.0 162.5Q179.0 169.0 187.5 163.0Q196.0 157.0 202.5 155.5Q209.0 154.0 210.0 156.0Q211.0 158.0 215.0 162.0Q219.0 166.0 220.0 166.0 L221.0 166.0 M170.0 113.0 L171.5 115.0Q173.0 117.0 185.0 125.5 L197.0 134.0";
const MATHILDA_PUNKTE = [[162.2,114.3,0.65],[163.8,114.8,0.68],[170.4,115.2,0.59],[162.3,120.9,0.56],[181.9,123.9,0.63],[175.0,126.9,0.62],[176.1,125.3,0.64],[189.2,130.0,0.73],[111.8,142.2,0.54],[204.7,140.8,0.66],[207.3,145.9,0.61],[171.2,154.9,0.55],[212.8,156.3,0.60],[199.9,159.9,0.59],[180.3,168.2,0.64],[196.1,174.1,0.66],[188.8,177.2,0.54],[192.3,177.3,0.68],[216.3,176.9,0.57],[233.6,177.5,0.75],[214.9,180.4,0.59],[143.7,182.6,0.62],[203.7,183.7,0.61],[207.2,183.6,0.57],[209.3,183.7,0.60],[119.8,186.5,0.63],[122.6,185.6,0.66],[203.6,186.4,0.57],[116.3,188.1,0.67],[119.3,189.7,0.67],[125.5,189.7,0.61],[129.7,188.6,0.69],[131.5,189.7,0.64],[134.6,188.8,0.60],[223.1,189.9,0.55],[204.6,192.8,0.66],[221.5,191.6,0.63],[108.2,194.5,0.56],[192.6,194.2,0.67],[195.4,195.1,0.62],[221.4,195.9,0.62],[107.3,198.1,0.62],[135.7,199.0,0.61],[153.3,198.9,0.66],[155.5,197.4,0.60],[183.7,196.8,0.66],[194.1,197.1,0.57],[217.1,198.9,0.56],[219.0,197.6,0.63],[221.6,198.4,0.60],[128.3,200.6,0.65],[153.1,201.5,0.66],[155.0,200.2,0.61],[159.3,201.7,0.62],[146.9,203.4,0.69],[150.5,203.0,0.69],[152.8,204.9,0.66],[194.9,203.1,0.59],[222.2,202.8,0.58],[120.7,205.9,0.56],[143.0,207.9,0.56],[150.8,206.1,0.68],[192.6,207.0,0.59],[206.6,207.2,0.59],[212.2,206.4,0.62],[165.0,211.1,0.57],[174.5,210.6,0.66],[212.0,210.6,0.61],[140.2,212.4,0.69],[165.5,214.1,0.59],[174.8,213.2,0.68],[176.3,211.9,0.66],[119.6,216.7,0.68],[127.2,216.0,0.68],[174.6,217.1,0.67],[173.3,218.4,0.58],[180.5,219.9,0.66],[176.0,221.0,0.68],[173.6,224.8,0.59],[176.3,225.2,0.66],[183.1,224.1,0.64],[204.4,224.1,0.62],[180.6,229.1,0.68],[207.0,227.6,0.69],[173.6,231.5,0.62],[209.2,230.0,0.63],[141.0,233.4,0.62],[215.4,233.0,0.59],[219.7,234.5,0.66],[221.3,233.8,0.63],[143.8,236.3,0.60],[170.4,237.7,0.59],[174.7,237.9,0.57],[174.6,240.4,0.57],[192.0,240.4,0.54],[176.7,242.4,0.62],[180.1,244.0,0.68],[183.9,243.5,0.68],[186.9,243.2,0.65],[183.7,247.0,0.69],[221.1,247.9,0.64],[224.3,248.2,0.54],[222.5,252.1,0.65],[206.9,255.6,0.65],[218.2,256.0,0.68],[110.7,258.1,0.70],[112.8,260.3,0.63],[209.9,260.3,0.57],[113.8,263.2,0.75],[116.1,263.2,0.55],[121.9,263.9,0.54],[182.8,263.8,0.58],[208.1,263.3,0.53],[116.9,266.2,0.62],[122.1,265.9,0.66],[129.4,271.1,0.66],[133.9,269.0,0.61],[136.9,268.9,0.55],[193.1,269.9,0.61],[113.5,273.3,0.75],[137.5,273.8,0.58],[158.7,272.6,0.60],[163.0,272.2,0.72],[203.8,272.4,0.63],[188.9,276.6,0.60],[194.4,276.8,0.62],[140.7,281.0,0.65],[144.2,284.1,0.59],[144.4,287.4,0.69],[146.4,298.1,0.68],[146.8,300.7,0.68],[145.1,308.3,0.70],[143.9,311.1,0.66],[206.6,312.0,0.62],[210.1,312.6,0.67],[213.4,312.3,0.65],[143.6,316.2,0.63],[206.0,314.3,0.62],[211.0,315.5,0.60],[125.0,324.5,0.60],[129.0,324.3,0.61],[132.6,323.5,0.62],[113.5,326.8,0.59],[125.2,327.6,0.59],[144.8,329.5,0.60],[110.1,336.1,0.58],[101.3,339.6,0.63],[149.2,337.8,0.55],[103.9,342.1,0.67],[107.5,341.4,0.59],[149.8,342.3,0.53],[74.1,345.6,0.69],[71.2,348.4,0.59],[104.9,348.7,0.63],[51.2,351.1,0.60],[66.4,350.7,0.60],[118.0,350.2,0.56],[137.5,352.1,0.64],[143.7,350.5,0.61],[146.4,352.2,0.55],[149.4,350.3,0.53],[53.5,355.1,0.52],[59.4,354.0,0.53],[68.4,355.1,0.58],[121.9,354.6,0.65],[125.3,354.8,0.59],[142.1,354.1,0.60],[143.1,353.7,0.63],[149.1,353.1,0.64],[152.6,355.0,0.62],[155.3,355.1,0.56],[47.6,357.6,0.56],[117.2,358.0,0.68],[124.1,357.8,0.65],[125.4,356.3,0.62],[145.1,356.8,0.53],[148.8,357.9,0.63],[162.6,356.0,0.70],[164.9,356.2,0.71],[167.6,357.0,0.68],[170.6,356.7,0.61],[68.1,360.0,0.60],[91.1,359.9,0.62],[93.1,360.9,0.65],[119.9,360.3,0.67],[122.8,360.8,0.66],[153.9,359.7,0.56],[162.1,360.9,0.64],[165.9,360.5,0.67],[167.5,360.0,0.66],[170.7,360.4,0.66],[23.6,362.5,0.68],[27.1,364.0,0.61],[72.4,362.1,0.62],[92.3,363.8,0.71],[127.9,362.6,0.57],[162.8,362.2,0.52],[168.0,362.8,0.63],[181.1,363.5,0.60],[196.8,363.0,0.57],[68.8,366.2,0.62],[74.7,365.0,0.58],[94.0,366.1,0.64],[95.0,365.4,0.67],[191.5,367.0,0.58],[195.1,366.3,0.59],[71.8,368.5,0.61],[96.8,370.1,0.59],[100.0,368.8,0.62],[121.9,369.0,0.64],[126.8,369.8,0.66],[128.8,368.7,0.62],[131.4,368.4,0.59],[206.3,368.9,0.56],[2.4,372.5,0.70],[18.4,372.3,0.65],[21.6,371.7,0.57],[102.7,372.9,0.64],[105.2,371.4,0.67],[132.8,373.2,0.66],[3.5,374.6,0.59],[15.2,374.1,0.70],[132.0,375.2,0.69],[6.6,378.1,0.67],[9.9,378.9,0.64],[132.4,378.6,0.62],[134.9,378.2,0.61]];

export function MathildaBild({ groesse = 220, style, className }) {
  return (
    <svg viewBox="0 0 320 440" width={groesse} height={Math.round(groesse * 440 / 320)} className={className} style={style}
      aria-label="Mathilda" role="img">
      <path fill={GOLD} fillRule="evenodd" d={MATHILDA_HAAR} />
      <path fill={"#FFFFFF"} fillRule="evenodd" d={MATHILDA_HAUT} />
      <path fill={NACHT} fillRule="evenodd" d={MATHILDA_SCHATTEN} />
      <path fill="none" stroke={NACHT} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" d={MATHILDA_KONTUR1} />
      <path fill="none" stroke={NACHT} strokeWidth="0.9" strokeLinecap="round" strokeLinejoin="round" d={MATHILDA_KONTUR2} />
      <path fill="none" stroke={NACHT} strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" d={MATHILDA_KONTUR3} />
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
    <svg viewBox="0 0 64 64" width="56" height="56" aria-hidden="true" style={{ display: "block", flex: "none" }}>
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
        .mathilda-kopf .mk-text-kachel { max-width: 760px; margin: 0 auto; padding: 0 24px 24px; }
        .mathilda-kopf .mk-text-kachel button { width: 100%; display: flex; align-items: center; gap: 12px; text-align: left; cursor: pointer; font-family: inherit; color: #FFFFFF; border-radius: 16px; padding: 12px 14px;
          border: 1.5px solid rgba(237,187,0,0.55); background: linear-gradient(135deg, rgba(237,187,0,0.16), rgba(255,255,255,0.04)); transition: transform .15s ease, background .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-text-kachel button:hover { transform: translateY(-2px); background: linear-gradient(135deg, rgba(237,187,0,0.24), rgba(255,255,255,0.06)); }
        .mathilda-kopf .mk-text-kachel b { display: block; font-size: 14.5px; font-weight: 700; }
        .mathilda-kopf .mk-text-kachel span.mk-tk-z { display: block; font-size: 12.5px; font-weight: 300; color: #C9D6EE; line-height: 1.4; }
        .mathilda-kopf .mk-text-kachel .mk-tk-neu { font-size: 10px; font-weight: 800; letter-spacing: .12em; color: ${NACHT}; background: ${GOLD}; border-radius: 999px; padding: 3px 8px; flex: none; }
        .mathilda-kopf .mk-bk { max-width: 760px; margin: 0 auto; padding: 0 24px 26px; }
        .mathilda-kopf .mk-bk button { width: 100%; display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer; font-family: inherit; color: #FFFFFF; border-radius: 18px; padding: 14px 16px;
          border: 1.5px solid rgba(255,255,255,0.16); background: linear-gradient(135deg, rgba(10,22,54,0.85), rgba(29,71,144,0.55)); box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
          transition: transform .15s ease, border-color .15s ease; -webkit-tap-highlight-color: transparent; }
        .mathilda-kopf .mk-bk button:hover { transform: translateY(-2px); border-color: rgba(237,187,0,0.6); }
        .mathilda-kopf .mk-bk .mk-bk-ober { display: block; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #FFFFFF; }
        .mathilda-kopf .mk-bk b { display: block; font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-top: 1px; }
        .mathilda-kopf .mk-bk .mk-bk-z { display: block; font-size: 12.5px; font-weight: 300; color: #C9D6EE; line-height: 1.45; margin-top: 2px; }
        .mathilda-kopf .mk-bk .mk-bk-schloss { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 11px; font-weight: 600; color: #E6EDF8; background: rgba(255,255,255,0.08); border-radius: 999px; padding: 3px 9px; }
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
      {onText && (
        <div className="mk-text-kachel">
          <button type="button" onClick={onText} data-mathilda-textaufgabe>
            <span className="mk-tk-neu">NEU</span>
            <span style={{ flex: 1, minWidth: 0 }}><b>Textaufgabe übersetzen</b><span className="mk-tk-z">Foto rein – Bedingungen raus. Jede Stelle mit Begründung.</span></span>
            <span aria-hidden="true" style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
          </button>
        </div>
      )}
      {onBriefkasten && (
        <div className="mk-bk">
          <button type="button" onClick={onBriefkasten} data-mathilda-briefkasten>
            <BriefkastenMini />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="mk-bk-ober">Mathilda<span style={{ color: GOLD }}>AI</span></span>
              <b>Klausurbriefkasten</b>
              <span className="mk-bk-z">Wirf deine zurückgegebene Klassenarbeit ein – Mathilda lernt daraus, bessere Testklausuren für deine Klasse zu bauen.</span>
              <span className="mk-bk-schloss"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={GOLD} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>Foto wird nicht gespeichert</span>
            </span>
            <span aria-hidden="true" style={{ color: GOLD, fontSize: 20, fontWeight: 700 }}>→</span>
          </button>
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
