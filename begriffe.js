/* Begriffe: Glossar-Daten, Glossar-Seite und antippbare Begriffe im Text */
(function () {
  'use strict';

  /* cat: abk | symbol | einheit | zeichen | begriff | stoff
     t: Begriff, x: Langform/Zusatz, d: Erklärung, e: Beispiel, see: Abschnitt,
     m: Schreibweisen im Text, w: Wortendungen erlaubt, ad: nur direkt nach einer Zahl */
  var G = [
    /* ---------------- Abkürzungen ---------------- */
    { id: 'ab', cat: 'abk', t: 'AB', x: 'Arbeitsblatt', d: 'Ein Arbeitsblatt aus eurem Unterricht. Auf deiner Themenliste steht bei jedem Punkt, welche ABs dazugehören.', m: ['AB'] },
    { id: 'ef', cat: 'abk', t: 'EF', x: 'Einführungsphase', d: 'Das erste Jahr der gymnasialen Oberstufe, in NRW meist Klasse 11.', m: ['EF'] },
    { id: 'pse', cat: 'abk', t: 'PSE', x: 'Periodensystem der Elemente', d: 'Die Tabelle aller Elemente. Daraus liest du zum Beispiel die Atommassen für die molare Masse ab.', m: ['PSE'] },
    { id: 'gg', cat: 'abk', t: 'GG, Ggw., ch. Ggw.', x: 'Gleichgewicht, chemisches Gleichgewicht', d: 'Kurzformen für das chemische Gleichgewicht. In der Simulation markiert „GG“ den Zeitpunkt, ab dem das Gleichgewicht erreicht ist.', see: 'c1', m: ['ch. Ggw.', 'Ggw.', 'GG'] },
    { id: 'mwg-abk', cat: 'abk', t: 'MWG', x: 'Massenwirkungsgesetz', d: 'Die Formel, mit der man K<sub>c</sub> aus den Gleichgewichtskonzentrationen berechnet.', see: 'c2', m: ['MWG'] },
    { id: 'rgt', cat: 'abk', t: 'RGT-Regel', x: 'Reaktionsgeschwindigkeit-Temperatur-Regel', d: 'Faustregel: Wird es 10 K (also 10 °C) wärmer, läuft eine Reaktion etwa 2- bis 4-mal so schnell.', see: 'b3', m: ['RGT-Regel', 'RGT'] },
    { id: 'agg', cat: 'abk', t: '(s), (l), (g), (aq)', x: 'Aggregatzustände in Reaktionsgleichungen', d: '(s) fest (englisch solid), (l) flüssig (liquid), (g) gasförmig (gas), (aq) in Wasser gelöst (lateinisch aqua, Wasser).', e: 'Mg(s) + 2 HCl(aq) → MgCl<sub>2</sub>(aq) + H<sub>2</sub>(g)', see: 'a1', m: ['(aq)', '(s)', '(l)', '(g)'] },
    { id: 'zb', cat: 'abk', t: 'z. B.', x: 'zum Beispiel', d: 'Leitet ein Beispiel ein.', m: ['z. B.'] },
    { id: 'ca', cat: 'abk', t: 'ca.', x: 'circa', d: 'ungefähr', m: ['ca.'] },
    { id: 'pkt', cat: 'abk', t: 'P.', x: 'Punkte', d: 'Punkte in der Probeklausur: „22 P.“ heißt 22 Punkte.', m: ['P.'], ad: true },
    { id: 'tage', cat: 'abk', t: 'Sa, So, Mo', x: 'Samstag, Sonntag, Montag', d: 'Die Tage im Lernplan.' },
    { id: 'codes', cat: 'abk', t: 'A, B, C und A1 bis C3', x: 'Teile deiner Themenliste', d: 'A sind die wichtigen Grundlagen, B ist die Reaktionsgeschwindigkeit, C das chemische Gleichgewicht. Die Nummern sind die einzelnen „Ich kann …“-Punkte von deinem Blatt.', see: 'selbstdiagnose' },
    { id: 'elementsymbole', cat: 'abk', t: 'H, O, C, Mg, HCl …', x: 'Elementsymbole und Formeln', d: 'Ein oder zwei Buchstaben stehen für ein Element: H Wasserstoff, O Sauerstoff, C Kohlenstoff, N Stickstoff, Cl Chlor, Mg Magnesium, Ca Calcium, Na Natrium, S Schwefel, I Iod, Mn Mangan. Formeln wie HCl oder CaCO<sub>3</sub> setzen sich daraus zusammen. Die Stoffnamen stehen unten unter „Stoffe“.' },

    /* ---------------- Formelzeichen ---------------- */
    { id: 'sym-m', cat: 'symbol', t: 'm', x: 'Masse', d: 'Einheit g (Gramm).', see: 'a2' },
    { id: 'sym-n', cat: 'symbol', t: 'n', x: 'Stoffmenge', d: 'Einheit mol. n(Mg) heißt „Stoffmenge von Magnesium“.', see: 'a2' },
    { id: 'sym-M', cat: 'symbol', t: 'M', x: 'molare Masse', d: 'Einheit g/mol. M(CO<sub>2</sub>) = 44 g/mol.', see: 'a2' },
    { id: 'sym-V', cat: 'symbol', t: 'V', x: 'Volumen', d: 'Einheit L oder mL. V(H<sub>2</sub>) ist das Volumen an Wasserstoff.', see: 'a2' },
    { id: 'sym-c', cat: 'symbol', t: 'c', x: 'Stoffmengenkonzentration', d: 'Einheit mol/L. c(HI) heißt „Konzentration von HI“, c²(HI) heißt „Konzentration von HI hoch 2“.', see: 'a2' },
    { id: 'vm', cat: 'symbol', t: 'V<sub>m</sub>', x: 'molares Volumen', d: 'Volumen von 1 mol Gas: 24 L/mol bei 20 °C, 22,4 L/mol bei 0 °C.', see: 'a2' },
    { id: 'sym-N', cat: 'symbol', t: 'N', x: 'Teilchenzahl', d: 'Anzahl der Teilchen, ohne Einheit: N = n · N<sub>A</sub>.', see: 'a2' },
    { id: 'na', cat: 'symbol', t: 'N<sub>A</sub>', x: 'Avogadro-Konstante', d: 'So viele Teilchen sind in 1 mol: 6,022 · 10<sup>23</sup> pro Mol (mol<sup>−1</sup>).', see: 'a2' },
    { id: 'rho', cat: 'symbol', t: 'ρ', x: 'Dichte (griechisch „rho“)', d: 'Masse pro Volumen: ρ = m / V, Einheit g/mL.', see: 'a2', m: ['ρ'] },
    { id: 'sym-t', cat: 'symbol', t: 't', x: 'Zeit', d: 'Einheit s (Sekunde).', see: 'b1' },
    { id: 'sym-v', cat: 'symbol', t: 'v', x: 'Reaktionsgeschwindigkeit', d: 'Einheit mol/(L·s), mol/s oder mL/s.', see: 'b1' },
    { id: 'vhin', cat: 'symbol', t: 'v<sub>hin</sub>', x: 'Geschwindigkeit der Hinreaktion', d: 'Wie schnell Edukte zu Produkten reagieren. Sie hängt von der Konzentration der Edukte ab: v<sub>hin</sub> = k<sub>hin</sub> · c(Edukt).', see: 'c1' },
    { id: 'vrueck', cat: 'symbol', t: 'v<sub>rück</sub>', x: 'Geschwindigkeit der Rückreaktion', d: 'Wie schnell Produkte wieder zu Edukten reagieren. Sie hängt von der Konzentration der Produkte ab: v<sub>rück</sub> = k<sub>rück</sub> · c(Produkt).', see: 'c1' },
    { id: 'khin', cat: 'symbol', t: 'k<sub>hin</sub>', x: 'Geschwindigkeitskonstante der Hinreaktion', d: 'Feste Zahl für eine Reaktion bei einer bestimmten Temperatur. Je größer, desto schneller läuft die Hinreaktion. Im Gleichgewicht gilt K<sub>c</sub> = k<sub>hin</sub> / k<sub>rück</sub>.', see: 'c2' },
    { id: 'krueck', cat: 'symbol', t: 'k<sub>rück</sub>', x: 'Geschwindigkeitskonstante der Rückreaktion', d: 'Wie k<sub>hin</sub>, nur für die Rückreaktion.', see: 'c2' },
    { id: 'ea', cat: 'symbol', t: 'E<sub>A</sub>', x: 'Aktivierungsenergie', d: 'Energie, die man mindestens braucht, damit eine Reaktion startet. Im Energiediagramm der „Hügel“.', see: 'a1' },
    { id: 'kc', cat: 'symbol', t: 'K<sub>c</sub> (oder kurz K)', x: 'Gleichgewichtskonstante', d: 'Das c steht für Konzentration. K<sub>c</sub> sagt, wo das Gleichgewicht liegt: größer als 1 heißt Produktseite, kleiner als 1 heißt Eduktseite. Sie hängt nur von der Temperatur ab.', see: 'c2' },
    { id: 'dh', cat: 'symbol', t: 'ΔH (auch ΔE)', x: 'Reaktionsenthalpie (Reaktionsenergie)', d: 'Energie der Produkte minus Energie der Edukte. Negativ heißt exotherm, positiv heißt endotherm. Einheit kJ/mol.', see: 'a1', m: ['ΔH', 'ΔE'] },
    { id: 'dnu', cat: 'symbol', t: 'Δν', x: 'Delta ny (griechisches n)', d: 'Summe der Koeffizienten der Produkte minus Summe der Koeffizienten der Edukte. Daraus folgt die Einheit von K<sub>c</sub>: (mol/L)<sup>Δν</sup>.', e: 'N<sub>2</sub> + 3 H<sub>2</sub> ⇌ 2 NH<sub>3</sub>: Δν = 2 − 4 = −2', see: 'c2', m: ['Δν'] },
    { id: 'delta', cat: 'symbol', t: 'Δ', x: 'Delta (griechisches D)', d: 'Bedeutet „Änderung“ oder „Differenz“: Endwert minus Anfangswert. Δt ist eine Zeitspanne, Δc eine Änderung der Konzentration, ΔV eine Änderung des Volumens.', e: 'c sinkt von 0,50 auf 0,30 mol/L: Δc = 0,30 − 0,50 = −0,20 mol/L', see: 'b1', m: ['Δ'] },
    { id: 'sym-p', cat: 'symbol', t: 'p', x: 'Druck', d: 'Einheit bar oder hPa.', see: 'c3' },
    { id: 'sym-T', cat: 'symbol', t: 'T', x: 'Temperatur', d: 'Einheit °C oder K.', see: 'b3' },
    { id: 'sym-x', cat: 'symbol', t: 'x, y', x: 'Unbekannte', d: 'Platzhalter für eine gesuchte Zahl in einer Rechnung, z. B. wie viel Stoff bis zum Gleichgewicht reagiert.', see: 'c2' },
    { id: 'sym-abde', cat: 'symbol', t: 'A, B, D, E und a, b, d, e', x: 'Platzhalter im allgemeinen MWG', d: 'Großbuchstaben stehen für beliebige Stoffe, Kleinbuchstaben für ihre Koeffizienten.', see: 'c2' },

    /* ---------------- Einheiten ---------------- */
    { id: 'u-mol', cat: 'einheit', t: 'mol, mmol', x: 'Mol, Millimol', d: 'Einheit der Stoffmenge. 1 mol sind 6,022 · 10<sup>23</sup> Teilchen. 1 mmol = 0,001 mol.' },
    { id: 'u-g', cat: 'einheit', t: 'g', x: 'Gramm', d: 'Einheit der Masse.' },
    { id: 'u-gmol', cat: 'einheit', t: 'g/mol', x: 'Gramm pro Mol', d: 'Einheit der molaren Masse.' },
    { id: 'u-l', cat: 'einheit', t: 'L, mL', x: 'Liter, Milliliter', d: 'Einheiten des Volumens. 1 L = 1000 mL.' },
    { id: 'u-moll', cat: 'einheit', t: 'mol/L', x: 'Mol pro Liter', d: 'Einheit der Konzentration.' },
    { id: 'u-lmol', cat: 'einheit', t: 'L/mol', x: 'Liter pro Mol', d: 'Einheit des molaren Volumens.' },
    { id: 'u-s', cat: 'einheit', t: 's', x: 'Sekunde', d: 'Einheit der Zeit.' },
    { id: 'u-v', cat: 'einheit', t: 'mol/(L·s), mol/s, mL/s', x: 'Einheiten der Reaktionsgeschwindigkeit', d: '„Mol pro Liter und Sekunde“ (bezogen auf die Konzentration), „Mol pro Sekunde“ (Stoffmenge), „Milliliter pro Sekunde“ (Gasvolumen).' },
    { id: 'u-c', cat: 'einheit', t: '°C', x: 'Grad Celsius', d: 'Einheit der Temperatur im Alltag.' },
    { id: 'kelvin', cat: 'einheit', t: 'K', x: 'Kelvin', d: 'Einheit der Temperatur. Ein Unterschied von 1 K ist genauso groß wie 1 °C. 0 °C entsprechen 273 K.', m: ['K'], ad: true },
    { id: 'u-kj', cat: 'einheit', t: 'kJ/mol', x: 'Kilojoule pro Mol', d: 'Einheit der Reaktionsenthalpie. Joule (J) ist die Einheit der Energie, 1 kJ = 1000 J.' },
    { id: 'u-bar', cat: 'einheit', t: 'bar, hPa', x: 'Bar, Hektopascal', d: 'Einheiten des Drucks. Der Luftdruck ist etwa 1 bar = 1013 hPa. 200 bar sind also ungefähr das 200-Fache des Luftdrucks.' },
    { id: 'u-gml', cat: 'einheit', t: 'g/mL', x: 'Gramm pro Milliliter', d: 'Einheit der Dichte.' },
    { id: 'u-hoch', cat: 'einheit', t: 'mol<sup>−1</sup>, L²/mol²', x: 'Einheiten mit Hochzahl', d: 'Hoch minus 1 heißt „pro“: mol<sup>−1</sup> = pro Mol. (mol/L)<sup>−2</sup> ist dasselbe wie L²/mol², die Einheit von K<sub>c</sub> bei Δν = −2.' },

    /* ---------------- Zeichen und Mathe ---------------- */
    { id: 'pfeil', cat: 'zeichen', t: '→', x: 'Reaktionspfeil', d: '„reagiert zu“. Links stehen die Edukte, rechts die Produkte.' },
    { id: 'gpfeil', cat: 'zeichen', t: '⇌', x: 'Gleichgewichtspfeil', d: 'Die Reaktion ist umkehrbar: Hin- und Rückreaktion laufen beide.', see: 'c1', m: ['⇌'] },
    { id: 'auf', cat: 'zeichen', t: '↑  ↓  ↑↑', x: 'steigt, sinkt, steigt stark', d: 'In Tabellen: Die Größe wird größer oder kleiner.' },
    { id: 'ungefaehr', cat: 'zeichen', t: '≈', x: 'ungefähr gleich', d: 'Das Ergebnis ist gerundet.' },
    { id: 'vgl', cat: 'zeichen', t: '≫, ≥, &gt;, &lt;', x: 'viel größer als, größer oder gleich, größer als, kleiner als', d: 'K ≫ 1 heißt: K ist sehr viel größer als 1. E ≥ E<sub>A</sub> heißt: mindestens so groß wie E<sub>A</sub>.', m: ['≫', '≥'] },
    { id: 'mal', cat: 'zeichen', t: '·', x: 'mal', d: 'Multiplikation: 0,5 mol · 24 L/mol.' },
    { id: 'geteilt', cat: 'zeichen', t: '÷  /', x: 'geteilt durch', d: 'Division. Bei Einheiten liest man den Schrägstrich als „pro“: mol/L ist „Mol pro Liter“.' },
    { id: 'hoch', cat: 'zeichen', t: '²  ³  10<sup>−3</sup>', x: 'hoch, Zehnerpotenz', d: 'c² = c · c. Zehnerpotenzen verschieben das Komma: 4,94 · 10<sup>−3</sup> = 0,00494. 6,022 · 10<sup>23</sup> ist eine riesige Zahl (602 Trilliarden).' },
    { id: 'wurzel', cat: 'zeichen', t: '√', x: 'Wurzel', d: 'Umkehrung von „hoch 2“: √4 = 2, weil 2² = 4. Damit löst du Gleichungen wie x² / (1 − x)² = 4.', see: 'c2', m: ['Wurzel'], w: true },
    { id: 'pm', cat: 'zeichen', t: '±', x: 'plus oder minus', d: 'Die pq-Formel liefert zwei Lösungen, einmal mit + und einmal mit −. In der Chemie ist meist nur eine davon sinnvoll.' },
    { id: 'halb', cat: 'zeichen', t: '½', x: 'ein halb', d: '0,5. In −½ · Δn(HCl) / Δt teilt man durch den Koeffizienten 2 von HCl.' },
    { id: 'haken', cat: 'zeichen', t: '✓', x: 'stimmt', d: 'Die Probe ist aufgegangen.' },
    { id: 'pq', cat: 'zeichen', t: 'pq-Formel', x: 'Lösungsformel für quadratische Gleichungen', d: 'Für x² + px + q = 0 gilt x = −p/2 ± √((p/2)² − q). Nimm die Lösung, die chemisch möglich ist (zwischen 0 und der Startmenge).', see: 'c2', m: ['pq-Formel'] },

    /* ---------------- Fachbegriffe ---------------- */
    { id: 'aggregatzustand', cat: 'begriff', t: 'Aggregatzustand', d: 'Zustand eines Stoffes: fest, flüssig oder gasförmig. Ändert sich nur der Aggregatzustand (z. B. Schmelzen), ist das keine chemische Reaktion.', see: 'a1', m: ['Aggregatzustand'], w: true },
    { id: 'aktivierungsenergie', cat: 'begriff', t: 'Aktivierungsenergie', x: 'E<sub>A</sub>', d: 'Energie, die man mindestens braucht, damit eine Reaktion startet. Im Energiediagramm ist sie der „Hügel“ zwischen Edukten und Produkten. Ein Katalysator senkt sie, eine höhere Temperatur nicht.', see: 'a1', m: ['Aktivierungsenergie'] },
    { id: 'analogie', cat: 'begriff', t: 'Analogie', d: 'Vergleich mit etwas Bekanntem, das ähnlich funktioniert, z. B. eine Autofahrt für Geschwindigkeiten oder die Bälleschlacht für das Gleichgewicht.', m: ['Analogie'] },
    { id: 'antwortsatz', cat: 'begriff', t: 'Antwortsatz', d: 'Ein ganzer Satz am Ende einer Rechnung, der die Frage beantwortet, mit Ergebnis und Einheit.', see: 'a2', m: ['Antwortsatz'] },
    { id: 'atom', cat: 'begriff', t: 'Atom', d: 'Kleinstes Teilchen eines Elements. Bei einer Reaktion bleiben alle Atome erhalten, sie werden nur neu verbunden.', m: ['Atom'], w: true },
    { id: 'ausbeute', cat: 'begriff', t: 'Ausbeute', d: 'Wie viel Produkt man tatsächlich erhält, verglichen mit der höchstmöglichen Menge, meist in Prozent.', e: '0,67 mol statt höchstens 1,0 mol sind 67 % Ausbeute.', see: 'c2', m: ['Ausbeute'], w: true },
    { id: 'ausgleichskurve', cat: 'begriff', t: 'Ausgleichskurve', d: 'Eine glatte Kurve, die möglichst gut durch alle Messpunkte läuft. Messwerte streuen etwas, die Kurve zeigt den Trend.', see: 'tangente', m: ['Ausgleichskurve'] },
    { id: 'ausrichtung', cat: 'begriff', t: 'Ausrichtung', x: 'Orientierung beim Stoß', d: 'Wie die Teilchen beim Zusammenstoß zueinander stehen. Nur wenn die passenden Stellen aufeinandertreffen, kann ein Stoß wirksam sein.', see: 'b3', m: ['Ausrichtung'] },
    { id: 'baelle', cat: 'begriff', t: 'Bälleschlacht', d: 'Modellversuch aus eurem Unterricht: Zwei Gruppen werfen Bälle hin und her. Er zeigt, wie sich ein dynamisches Gleichgewicht einstellt und woher das Massenwirkungsgesetz kommt.', see: 'c2', m: ['Bälleschlacht'] },
    { id: 'begrenzend', cat: 'begriff', t: 'begrenzender Stoff', d: 'Der Stoff, der zuerst aufgebraucht ist. Er bestimmt, wie viel Produkt höchstens entstehen kann. Die anderen Stoffe liegen im Überschuss vor.', see: 'a2', m: ['begrenzend'], w: true },
    { id: 'bindung', cat: 'begriff', t: 'Bindung', d: 'Zusammenhalt zwischen Atomen. Bei einer chemischen Reaktion werden Bindungen gelöst und neue geknüpft.', m: ['Bindung'], w: true },
    { id: 'chemreaktion', cat: 'begriff', t: 'chemische Reaktion', d: 'Vorgang, bei dem neue Stoffe mit neuen Eigenschaften entstehen und Energie umgesetzt wird.', see: 'a1', m: ['chemische Reaktion', 'chemischen Reaktion', 'Chemische Reaktion'] },
    { id: 'ct', cat: 'begriff', t: 'c(t)-Diagramm', d: 'Diagramm mit der Zeit t auf der x-Achse und der Konzentration c auf der y-Achse.', see: 'b1', m: ['c(t)-Diagramm'] },
    { id: 'druck', cat: 'begriff', t: 'Druck', x: 'p', d: 'Bei Gasen: wie stark die Gasteilchen gegen die Gefäßwände drücken. Mehr Druck heißt, die Gasteilchen sind dichter gepackt. Einheit bar oder hPa.', see: 'c3', m: ['Druck'], w: true },
    { id: 'durchschnitt', cat: 'begriff', t: 'Durchschnittsgeschwindigkeit', d: 'Reaktionsgeschwindigkeit über einen Zeitraum: Änderung geteilt durch Zeitspanne, v = Δc / Δt. Im Diagramm ist das die Steigung der Sekante.', see: 'b1', m: ['Durchschnitt'], w: true },
    { id: 'dynamisch', cat: 'begriff', t: 'dynamisches Gleichgewicht', d: 'Gleichgewicht, in dem Hin- und Rückreaktion weiterlaufen, aber gleich schnell. Deshalb bleiben die Konzentrationen konstant, obwohl ständig Teilchen reagieren.', see: 'c1', m: ['dynamisch', 'Dynamisch'], w: true },
    { id: 'edukt', cat: 'begriff', t: 'Edukt', x: 'Ausgangsstoff', d: 'Stoff, der bei einer Reaktion verbraucht wird. Steht in der Reaktionsgleichung links vom Pfeil.', e: 'Bei Mg + 2 HCl → MgCl<sub>2</sub> + H<sub>2</sub> sind Mg und HCl die Edukte.', see: 'a1', m: ['Edukt'], w: true },
    { id: 'einflussfaktor', cat: 'begriff', t: 'Einflussfaktor', d: 'Etwas, das die Reaktionsgeschwindigkeit verändert: Konzentration, Druck, Zerteilungsgrad, Temperatur oder ein Katalysator.', see: 'b3', m: ['Einflussfaktor'], w: true },
    { id: 'einheit', cat: 'begriff', t: 'Einheit', d: 'Gibt an, worin eine Größe gemessen wird, z. B. g, mol oder mol/L. Beim Rechnen immer mitschreiben.', see: 'a2', m: ['Einheit'], w: true },
    { id: 'element', cat: 'begriff', t: 'Element', d: 'Reiner Stoff aus nur einer Atomsorte, z. B. Magnesium (Mg) oder Wasserstoff (H<sub>2</sub>). Alle Elemente stehen im Periodensystem.', m: ['Element'], w: true },
    { id: 'endotherm', cat: 'begriff', t: 'endotherm', d: 'Die Reaktion nimmt Energie aus der Umgebung auf. ΔH ist positiv, die Produkte sind energiereicher als die Edukte.', see: 'a1', m: ['endotherm', 'Endotherm'], w: true },
    { id: 'endvolumen', cat: 'begriff', t: 'Endvolumen', d: 'Das Gasvolumen am Schluss, wenn die Reaktion vorbei ist. Es hängt nur von der Menge des begrenzenden Stoffes ab.', see: 'b3', m: ['Endvolumen'] },
    { id: 'energiediagramm', cat: 'begriff', t: 'Energiediagramm', d: 'Zeigt die Energie von Edukten, „Hügel“ (Aktivierungsenergie) und Produkten im Verlauf der Reaktion.', see: 'a1', m: ['Energiediagramm'], w: true },
    { id: 'energieumwandlung', cat: 'begriff', t: 'Energieumwandlung', d: 'Bei jeder chemischen Reaktion wird Energie abgegeben oder aufgenommen, z. B. als Wärme oder Licht.', see: 'a1', m: ['Energieumwandlung'] },
    { id: 'energieverteilung', cat: 'begriff', t: 'Energieverteilung', d: 'Zeigt, wie viele Teilchen welche Energie haben. Die Teilchen sind nicht gleich schnell: wenige sehr langsam, wenige sehr schnell, die meisten dazwischen.', see: 'b3', m: ['Energieverteilung'] },
    { id: 'enzym', cat: 'begriff', t: 'Enzym', d: 'Katalysator in Lebewesen (Biokatalysator), z. B. bei der Verdauung.', m: ['Enzym'], w: true },
    { id: 'exotherm', cat: 'begriff', t: 'exotherm', d: 'Die Reaktion gibt Energie an die Umgebung ab. ΔH ist negativ, die Produkte sind energieärmer als die Edukte.', see: 'a1', m: ['exotherm', 'Exotherm'], w: true },
    { id: 'exponent', cat: 'begriff', t: 'Exponent', x: 'Hochzahl', d: 'Die kleine hochgestellte Zahl. Im MWG werden die Koeffizienten zu Exponenten.', e: 'c²(HI) = c(HI) · c(HI)', see: 'c2', m: ['Exponent'], w: true },
    { id: 'formel', cat: 'begriff', t: 'Formel (chemische)', d: 'Schreibweise eines Stoffes mit Elementsymbolen und Indexzahlen, z. B. H<sub>2</sub>O oder MgCl<sub>2</sub>.', m: ['Formel'], w: true },
    { id: 'gasteilchen', cat: 'begriff', t: 'Gasteilchen', d: 'Teilchen eines gasförmigen Stoffes. Für den Einfluss des Drucks zählst du die Koeffizienten der Gase links und rechts.', see: 'c3', m: ['Gasteilchen'] },
    { id: 'geschlossen', cat: 'begriff', t: 'geschlossenes System', d: 'Gefäß, aus dem kein Stoff entweichen und in das kein Stoff hineinkommen kann. Voraussetzung für ein Gleichgewicht. In einem offenen Gefäß kann z. B. CO<sub>2</sub> entweichen, dann läuft die Reaktion vollständig ab.', see: 'c1', m: ['geschlossen'], w: true },
    { id: 'gleichgewicht', cat: 'begriff', t: 'chemisches Gleichgewicht', d: 'Zustand einer umkehrbaren Reaktion, in dem Hin- und Rückreaktion gleich schnell ablaufen. Die Konzentrationen bleiben dann konstant, sind aber meist nicht gleich.', see: 'c1', m: ['chemisches Gleichgewicht', 'chemische Gleichgewicht', 'chemischen Gleichgewicht', 'Chemisches Gleichgewicht', 'Gleichgewicht'], w: true },
    { id: 'ggkonst', cat: 'begriff', t: 'Gleichgewichtskonstante', x: 'K<sub>c</sub>', d: 'Zahl, die angibt, wo ein Gleichgewicht liegt. Man berechnet sie mit dem Massenwirkungsgesetz. Sie hängt nur von der Temperatur ab.', see: 'c2', m: ['Gleichgewichtskonstante'], w: true },
    { id: 'ggkonz', cat: 'begriff', t: 'Gleichgewichtskonzentration', d: 'Konzentration eines Stoffes, wenn das Gleichgewicht erreicht ist. Nur diese Werte gehören ins MWG.', see: 'c2', m: ['Gleichgewichtskonzentration'], w: true },
    { id: 'verschiebung', cat: 'begriff', t: 'Gleichgewichtsverschiebung', d: '„Das Gleichgewicht verschiebt sich nach rechts“ heißt: Es bildet sich mehr Produkt, bis sich das Gleichgewicht neu eingestellt hat. „Nach links“ heißt: mehr Edukt.', see: 'c3', m: ['verschiebt', 'verschieben', 'Verschieben', 'Verschiebung', 'verschoben'] },
    { id: 'haberbosch', cat: 'begriff', t: 'Haber-Bosch-Verfahren', d: 'Großtechnische Herstellung von Ammoniak aus Stickstoff und Wasserstoff: N<sub>2</sub> + 3 H<sub>2</sub> ⇌ 2 NH<sub>3</sub>. Wichtig vor allem für Dünger.', see: 'c3', m: ['Haber-Bosch'] },
    { id: 'hinreaktion', cat: 'begriff', t: 'Hinreaktion', d: 'Die Reaktion von links nach rechts, also von den Edukten zu den Produkten.', see: 'c1', m: ['Hinreaktion'], w: true },
    { id: 'index', cat: 'begriff', t: 'Index (Indexzahl)', d: 'Die kleine tiefgestellte Zahl in einer Formel. Sie gibt an, wie viele Atome im Teilchen stecken (H<sub>2</sub>O: 2 H-Atome). Beim Ausgleichen darf man sie nicht ändern.', see: 'a1', m: ['Indexzahl', 'Index'] },
    { id: 'intervall', cat: 'begriff', t: 'Intervall', d: 'Zeitabschnitt zwischen zwei Zeitpunkten, z. B. von 10 s bis 30 s.', see: 'b1', m: ['Intervall'], w: true },
    { id: 'katalysator', cat: 'begriff', t: 'Katalysator', d: 'Stoff, der eine Reaktion beschleunigt, weil er einen Weg mit kleinerer Aktivierungsenergie ermöglicht. Er wird nicht verbraucht und verschiebt kein Gleichgewicht.', see: 'a1', m: ['Katalysator'], w: true },
    { id: 'koeffizient', cat: 'begriff', t: 'Koeffizient', d: 'Die große Zahl vor einer Formel in der Reaktionsgleichung. Sie gibt das Verhältnis der Stoffmengen an.', e: 'In 2 Mg + O<sub>2</sub> → 2 MgO ist die 2 vor Mg ein Koeffizient.', see: 'a1', m: ['Koeffizient'], w: true },
    { id: 'konzentration', cat: 'begriff', t: 'Konzentration', x: 'Stoffmengenkonzentration c', d: 'Wie viel Stoff in einem bestimmten Volumen gelöst ist: c = n / V, Einheit mol/L.', see: 'a2', m: ['Stoffmengenkonzentration', 'Konzentration'], w: true },
    { id: 'konzverlauf', cat: 'begriff', t: 'Konzentrationsverlauf', d: 'Wie sich die Konzentration eines Stoffes mit der Zeit ändert, meist als c(t)-Diagramm gezeichnet.', see: 'c1', m: ['Konzentrationsverlauf', 'Konzentrationsverläufe'], w: true },
    { id: 'lage', cat: 'begriff', t: 'Lage des Gleichgewichts', d: 'Gibt an, ob im Gleichgewicht mehr Produkte (Lage rechts, K &gt; 1) oder mehr Edukte (Lage links, K &lt; 1) vorliegen.', see: 'c2', m: ['Lage'] },
    { id: 'lechatelier', cat: 'begriff', t: 'Prinzip von Le Chatelier', x: 'Prinzip vom kleinsten Zwang', d: 'Übt man auf ein Gleichgewicht einen Zwang aus (Konzentration, Druck oder Temperatur ändern), verschiebt es sich so, dass die Wirkung des Zwangs kleiner wird. Benannt nach dem französischen Chemiker Henry Le Chatelier.', see: 'c3', m: ['Le Chatelier', 'Prinzip vom kleinsten Zwang'] },
    { id: 'masse', cat: 'begriff', t: 'Masse', x: 'm', d: 'Wie schwer etwas ist, Einheit g.', see: 'a2', m: ['Masse'], w: true },
    { id: 'massenkonz', cat: 'begriff', t: 'Massenkonzentration', d: 'Masse eines gelösten Stoffes pro Volumen, Einheit g/L. Nicht verwechseln mit der Stoffmengenkonzentration in mol/L.', m: ['Massenkonzentration'] },
    { id: 'mwg', cat: 'begriff', t: 'Massenwirkungsgesetz', x: 'MWG', d: 'Formel für die Gleichgewichtskonstante: Konzentrationen der Produkte in den Zähler, der Edukte in den Nenner, Koeffizienten als Exponenten.', e: 'H<sub>2</sub> + I<sub>2</sub> ⇌ 2 HI: K<sub>c</sub> = c²(HI) / (c(H<sub>2</sub>) · c(I<sub>2</sub>))', see: 'c2', m: ['Massenwirkungsgesetz'], w: true },
    { id: 'messwert', cat: 'begriff', t: 'Messwert', d: 'Ein im Versuch gemessener Wert, z. B. das Gasvolumen nach 20 s.', m: ['Messwert'], w: true },
    { id: 'molaremasse', cat: 'begriff', t: 'molare Masse', x: 'M', d: 'Masse von 1 mol eines Stoffes, Einheit g/mol. Du addierst die Atommassen aus dem PSE.', e: 'M(CO<sub>2</sub>) = 12 + 2 · 16 = 44 g/mol', see: 'a2', m: ['molare Masse', 'molaren Masse', 'Molare Masse'] },
    { id: 'molaresvolumen', cat: 'begriff', t: 'molares Volumen', x: 'V<sub>m</sub>', d: 'Volumen von 1 mol eines Gases: 24 L/mol bei 20 °C, 22,4 L/mol bei 0 °C (jeweils bei normalem Luftdruck). Für alle Gase gleich.', see: 'a2', m: ['molares Volumen', 'Molares Volumen', 'molaren Volumen'] },
    { id: 'molekuel', cat: 'begriff', t: 'Molekül', d: 'Teilchen aus mehreren fest verbundenen Atomen, z. B. H<sub>2</sub>O oder O<sub>2</sub>.', m: ['Molekül'], w: true },
    { id: 'momentan', cat: 'begriff', t: 'Momentangeschwindigkeit', d: 'Reaktionsgeschwindigkeit genau zu einem Zeitpunkt, wie der Tacho im Auto. Im Diagramm ist das die Steigung der Tangente.', see: 'b1', m: ['Momentan', 'momentan'], w: true },
    { id: 'oberflaeche', cat: 'begriff', t: 'Oberfläche', d: 'Die äußere Fläche eines Feststoffs. Pulver hat bei gleicher Masse eine viel größere Oberfläche als ein Stück, deshalb reagiert es schneller.', see: 'b3', m: ['Oberfläche'] },
    { id: 'operator', cat: 'begriff', t: 'Operator', d: 'Das Verb in einer Aufgabe (nennen, erklären, berechnen …). Es sagt dir genau, was du tun sollst.', see: 'operatoren', m: ['Operator'], w: true },
    { id: 'probe', cat: 'begriff', t: 'Probe', x: 'beim Rechnen', d: 'Kontrolle am Ende einer Rechnung: Ergebnis wieder einsetzen und prüfen, ob es stimmt.', m: ['Probe'] },
    { id: 'produkt', cat: 'begriff', t: 'Produkt', d: 'Stoff, der bei einer Reaktion entsteht. Steht in der Reaktionsgleichung rechts vom Pfeil.', see: 'a1', m: ['Produkt'], w: true },
    { id: 'quotient', cat: 'begriff', t: 'Quotient', d: 'Ergebnis einer Division, also ein Bruch. Setzt man die aktuellen Konzentrationen ins MWG ein, erhält man einen Quotienten. Im Gleichgewicht ist er genau K.', see: 'c3', m: ['Quotient'], w: true },
    { id: 'enthalpie', cat: 'begriff', t: 'Reaktionsenthalpie', x: 'ΔH, auch Reaktionsenergie ΔE', d: 'Energie, die bei einer Reaktion abgegeben oder aufgenommen wird: Energie der Produkte minus Energie der Edukte. Negativ heißt exotherm, positiv heißt endotherm.', see: 'a1', m: ['Reaktionsenthalpie', 'Reaktionsenergie'] },
    { id: 'rg', cat: 'begriff', t: 'Reaktionsgeschwindigkeit', x: 'v', d: 'Wie schnell sich die Konzentration (oder Stoffmenge, Masse, Gasvolumen) eines Stoffes pro Zeit ändert: v = Δc / Δt.', see: 'b1', m: ['Reaktionsgeschwindigkeit'], w: true },
    { id: 'reaktionsgleichung', cat: 'begriff', t: 'Reaktionsgleichung', d: 'Beschreibt eine Reaktion mit Formeln: Edukte links, Pfeil, Produkte rechts. Auf beiden Seiten müssen gleich viele Atome jeder Sorte stehen. Das erreicht man mit Koeffizienten („ausgleichen“).', see: 'a1', m: ['Reaktionsgleichung'], w: true },
    { id: 'rechenweg', cat: 'begriff', t: 'Rechenweg (Lösungsweg)', d: 'Alle Schritte einer Rechnung: gegeben, gesucht, Formel, Einsetzen mit Einheiten, Ergebnis, Antwortsatz.', see: 'a2', m: ['Rechenweg', 'Lösungsweg'], w: true },
    { id: 'rueckreaktion', cat: 'begriff', t: 'Rückreaktion', d: 'Die Reaktion von rechts nach links, also von den Produkten zurück zu den Edukten.', see: 'c1', m: ['Rückreaktion'], w: true },
    { id: 'saeure', cat: 'begriff', t: 'Säure', d: 'Stoff, der in Wasser H<sup>+</sup>-Ionen (Protonen) abgibt, z. B. Salzsäure oder Ethansäure.', m: ['Säure'], w: true },
    { id: 'sekante', cat: 'begriff', t: 'Sekante', d: 'Gerade durch zwei Punkte einer Kurve. Ihre Steigung ist die Durchschnittsgeschwindigkeit zwischen diesen Punkten.', see: 'b1', m: ['Sekante'], w: true },
    { id: 'simulation', cat: 'begriff', t: 'Simulation', d: 'Der Computer berechnet den Ablauf einer Reaktion Schritt für Schritt aus einfachen Regeln und zeichnet ihn.', see: 'sim', m: ['Simulation'] },
    { id: 'start', cat: 'begriff', t: 'Startkonzentration (Startwert)', d: 'Konzentration oder Menge eines Stoffes zu Beginn, bevor die Reaktion läuft. Gehört nicht ins MWG.', see: 'c2', m: ['Startkonzentration', 'Startwert', 'Startmenge', 'Startzustand'], w: true },
    { id: 'steigung', cat: 'begriff', t: 'Steigung', d: 'Wie steil eine Gerade ist: Δy / Δx. Ist die x-Achse die Zeit, ist die Steigung eine Geschwindigkeit.', see: 'b1', m: ['Steigung'], w: true },
    { id: 'steigungsdreieck', cat: 'begriff', t: 'Steigungsdreieck', d: 'Rechtwinkliges Dreieck an einer Geraden. Die waagerechte Seite ist Δx (hier Δt), die senkrechte Seite Δy. Die Steigung ist Δy / Δx.', see: 'tangente', m: ['Steigungsdreieck'] },
    { id: 'stoffmenge', cat: 'begriff', t: 'Stoffmenge', x: 'n', d: 'Anzahl der Teilchen, gezählt in mol. 1 mol = 6,022 · 10<sup>23</sup> Teilchen. Berechnung: n = m / M.', see: 'a2', m: ['Stoffmenge'], w: true },
    { id: 'verhaeltnis', cat: 'begriff', t: 'Stoffmengenverhältnis', d: 'Verhältnis, in dem Stoffe reagieren. Es steht in den Koeffizienten der Reaktionsgleichung.', e: 'Mg + 2 HCl: n(Mg) : n(HCl) = 1 : 2', see: 'a2', m: ['Stoffmengenverhältnis'] },
    { id: 'stoffumwandlung', cat: 'begriff', t: 'Stoffumwandlung', d: 'Aus den Ausgangsstoffen entstehen neue Stoffe mit anderen Eigenschaften. Kennzeichen jeder chemischen Reaktion.', see: 'a1', m: ['Stoffumwandlung'] },
    { id: 'stosstheorie', cat: 'begriff', t: 'Stoßtheorie', d: 'Modell: Teilchen reagieren nur, wenn sie zusammenstoßen, und zwar mit genug Energie (mindestens E<sub>A</sub>) und passender Ausrichtung.', see: 'b3', m: ['Stoßtheorie'] },
    { id: 'stosswahr', cat: 'begriff', t: 'Stoßwahrscheinlichkeit', d: 'Wie oft Teilchen in einer bestimmten Zeit zusammenstoßen. Sie steigt mit Konzentration, Druck und Oberfläche.', see: 'b3', m: ['Stoßwahrscheinlichkeit'] },
    { id: 'tangente', cat: 'begriff', t: 'Tangente', d: 'Gerade, die eine Kurve in genau einem Punkt berührt. Ihre Steigung ist die Momentangeschwindigkeit zu diesem Zeitpunkt.', see: 'tangente', m: ['Tangente'], w: true },
    { id: 'teilchen', cat: 'begriff', t: 'Teilchen', d: 'Sammelbegriff für die winzigen Bausteine der Stoffe: Atome, Moleküle oder Ionen.', m: ['Teilchen'], w: true },
    { id: 'teilchenebene', cat: 'begriff', t: 'Teilchenebene', d: 'Blick auf die einzelnen Teilchen statt auf das, was man mit bloßem Auge sieht.', m: ['Teilchenebene'] },
    { id: 'teilchenzahl', cat: 'begriff', t: 'Teilchenzahl', x: 'N', d: 'Anzahl der Teilchen: N = n · N<sub>A</sub>.', see: 'a2', m: ['Teilchenzahl'] },
    { id: 'truebung', cat: 'begriff', t: 'Trübung', d: 'Die Lösung wird undurchsichtig, weil sich feste Teilchen bilden (hier Schwefel). Daran misst man die Geschwindigkeit, z. B. wie lange es dauert, bis ein Kreuz unter dem Glas verschwindet.', see: 'b2', m: ['Trübung'] },
    { id: 'ueberschuss', cat: 'begriff', t: 'Überschuss', d: 'Von einem Stoff ist mehr da, als für die Reaktion gebraucht wird. Ein Rest bleibt übrig.', see: 'a2', m: ['Überschuss'] },
    { id: 'umkehrbar', cat: 'begriff', t: 'umkehrbare Reaktion', d: 'Reaktion, die in beide Richtungen ablaufen kann. Man schreibt den Doppelpfeil ⇌.', see: 'c1', m: ['umkehrbar', 'Umkehrung'], w: true },
    { id: 'volumen', cat: 'begriff', t: 'Volumen', x: 'V', d: 'Raum, den ein Stoff einnimmt, Einheit L oder mL. Für c = n / V immer in Liter umrechnen.', see: 'a2', m: ['Volumen'] },
    { id: 'wirksam', cat: 'begriff', t: 'wirksamer Stoß', d: 'Zusammenstoß, der wirklich zur Reaktion führt: genug Energie (mindestens E<sub>A</sub>) und passende Ausrichtung.', see: 'b3', m: ['wirksam'], w: true },
    { id: 'wortgleichung', cat: 'begriff', t: 'Wortgleichung', d: 'Reaktionsgleichung mit Namen statt Formeln, z. B. Magnesium + Salzsäure → Magnesiumchlorid + Wasserstoff.', see: 'a1', m: ['Wortgleichung'] },
    { id: 'zaehler', cat: 'begriff', t: 'Zähler und Nenner', d: 'Bei einem Bruch steht der Zähler oben, der Nenner unten. Im MWG stehen die Produkte im Zähler, die Edukte im Nenner.', see: 'c2', m: ['Zähler', 'Nenner'] },
    { id: 'zerteilung', cat: 'begriff', t: 'Zerteilungsgrad', d: 'Wie fein ein Feststoff zerkleinert ist: Stück, Körner oder Pulver. Je feiner, desto größer die Oberfläche.', see: 'b3', m: ['Zerteilungsgrad'] },
    { id: 'stoss', cat: 'begriff', t: 'Zusammenstoß (Stoß)', d: 'Teilchen bewegen sich ständig und stoßen zusammen. Nur bei einem Zusammenstoß können sie miteinander reagieren.', see: 'b3', m: ['Zusammenstöße', 'Zusammenstoß', 'Stöße', 'Stoß'] },
    { id: 'zwang', cat: 'begriff', t: 'Zwang', d: 'Eine Änderung von außen an einem Gleichgewicht: einen Stoff zugeben oder entfernen, Druck oder Temperatur ändern.', see: 'c3', m: ['Zwang'] },
    { id: 'zweiatomig', cat: 'begriff', t: 'zweiatomig', d: 'Manche Elemente kommen als Moleküle aus zwei Atomen vor: H<sub>2</sub>, N<sub>2</sub>, O<sub>2</sub>, F<sub>2</sub>, Cl<sub>2</sub>, Br<sub>2</sub>, I<sub>2</sub>.', see: 'a1', m: ['zweiatomig', 'Zweiatomig'], w: true },
    { id: 'kolbenprober', cat: 'begriff', t: 'Kolbenprober', d: 'Glasspritze mit beweglichem Kolben, an deren Skala man ein Gasvolumen abliest.', see: 'b2', m: ['Kolbenprober'] },
    { id: 'messzylinder', cat: 'begriff', t: 'Messzylinder', d: 'Glaszylinder mit Skala zum Messen von Volumen, auch von aufgefangenem Gas.', see: 'b2', m: ['Messzylinder'] },
    { id: 'fotometer', cat: 'begriff', t: 'Fotometer', d: 'Gerät, das misst, wie viel Licht eine Lösung durchlässt. So verfolgt man Farbänderungen.', see: 'b2', m: ['Fotometer'] },
    { id: 'leitfaehigkeit', cat: 'begriff', t: 'Leitfähigkeit', d: 'Wie gut eine Lösung elektrischen Strom leitet. Sie hängt davon ab, wie viele Ionen gelöst sind.', see: 'b2', m: ['Leitfähigkeit'] },
    { id: 'ph', cat: 'begriff', t: 'pH-Wert', d: 'Maß dafür, wie sauer (unter 7), neutral (7) oder alkalisch (über 7) eine Lösung ist.', see: 'b2', m: ['pH-Wert'] },

    /* ---------------- Stoffe ---------------- */
    { id: 'alkohol', cat: 'stoff', t: 'Alkohol', d: 'Stoffgruppe mit einer OH-Gruppe im Molekül. Hier ist meist Ethanol gemeint.', m: ['Alkohol'], w: true },
    { id: 'ammoniak', cat: 'stoff', t: 'Ammoniak', x: 'NH<sub>3</sub>', d: 'Stechend riechendes Gas. Wird im Haber-Bosch-Verfahren aus Stickstoff und Wasserstoff hergestellt (Ammoniaksynthese).', see: 'c3', m: ['Ammoniak'], w: true },
    { id: 'braunstein', cat: 'stoff', t: 'Braunstein', x: 'MnO<sub>2</sub>, Mangandioxid', d: 'Schwarzbraunes Pulver. Katalysator beim Zerfall von Wasserstoffperoxid.', m: ['Braunstein'] },
    { id: 'n2o4', cat: 'stoff', t: 'Distickstofftetroxid', x: 'N<sub>2</sub>O<sub>4</sub>', d: 'Farbloses Gas aus zwei verbundenen NO<sub>2</sub>-Molekülen.', see: 'c3' },
    { id: 'eisen', cat: 'stoff', t: 'Eisen', x: 'Fe', d: 'Metall. Beim Haber-Bosch-Verfahren dient es als Katalysator.', m: ['Eisen'] },
    { id: 'ester', cat: 'stoff', t: 'Ester', d: 'Stoff, der aus einer Säure und einem Alkohol unter Abspaltung von Wasser entsteht. Viele Ester riechen fruchtig.', see: 'c2', m: ['Ester'], w: true },
    { id: 'ethansaeure', cat: 'stoff', t: 'Ethansäure', x: 'Essigsäure, CH<sub>3</sub>COOH', d: 'Die Säure im Essig.', m: ['Ethansäure'] },
    { id: 'ethylester', cat: 'stoff', t: 'Ethansäureethylester', x: 'Essigester', d: 'Ester aus Ethansäure und Ethanol. Wird als Lösemittel verwendet, z. B. in Klebstoffen.', m: ['Ethansäureethylester'] },
    { id: 'ethanol', cat: 'stoff', t: 'Ethanol', x: 'C<sub>2</sub>H<sub>5</sub>OH', d: 'Trinkalkohol.', m: ['Ethanol'] },
    { id: 'iod', cat: 'stoff', t: 'Iod', x: 'I<sub>2</sub>', d: 'Element aus der Gruppe der Halogene. Fest grau-violett, als Gas violett.' },
    { id: 'iodwasserstoff', cat: 'stoff', t: 'Iodwasserstoff', x: 'HI', d: 'Gas aus Wasserstoff und Iod. Klassisches Beispiel für ein Gleichgewicht: H<sub>2</sub> + I<sub>2</sub> ⇌ 2 HI.', see: 'c2', m: ['Iodwasserstoff'], w: true },
    { id: 'kochsalz', cat: 'stoff', t: 'Kochsalz', x: 'Natriumchlorid, NaCl', d: 'Speisesalz.', m: ['Kochsalz'] },
    { id: 'co2', cat: 'stoff', t: 'Kohlenstoffdioxid', x: 'CO<sub>2</sub>', d: 'Farbloses Gas. Entsteht z. B., wenn Marmor mit Salzsäure reagiert.', m: ['Kohlenstoffdioxid'] },
    { id: 'magnesium', cat: 'stoff', t: 'Magnesium', x: 'Mg', d: 'Leichtes, unedles Metall. Reagiert mit Säuren, dabei entsteht Wasserstoff.', m: ['Magnesium'], w: true },
    { id: 'mgcl2', cat: 'stoff', t: 'Magnesiumchlorid', x: 'MgCl<sub>2</sub>', d: 'Ein Salz. Entsteht aus Magnesium und Salzsäure.', m: ['Magnesiumchlorid'] },
    { id: 'marmor', cat: 'stoff', t: 'Marmor', x: 'CaCO<sub>3</sub>, Calciumcarbonat', d: 'Gestein, chemisch dasselbe wie Kalk. Reagiert mit Salzsäure, dabei entweicht CO<sub>2</sub>.', m: ['Marmor'], w: true },
    { id: 'naoh', cat: 'stoff', t: 'Natriumhydroxid', x: 'NaOH', d: 'Weißer Feststoff. In Wasser gelöst ergibt er Natronlauge.', m: ['Natriumhydroxid'] },
    { id: 'platin', cat: 'stoff', t: 'Platin', x: 'Pt', d: 'Edelmetall. Katalysator, z. B. im Autokatalysator.', m: ['Platin'] },
    { id: 'salzsaeure', cat: 'stoff', t: 'Salzsäure', x: 'HCl(aq)', d: 'Lösung von Chlorwasserstoff (HCl) in Wasser. Eine starke Säure.', m: ['Salzsäure'] },
    { id: 'sauerstoff', cat: 'stoff', t: 'Sauerstoff', x: 'O<sub>2</sub>', d: 'Gas, etwa ein Fünftel der Luft.', m: ['Sauerstoff'], w: true },
    { id: 'schwefel', cat: 'stoff', t: 'Schwefel', x: 'S', d: 'Gelber Feststoff. Trübt die Lösung bei der Reaktion von Thiosulfat mit Salzsäure.', m: ['Schwefel'] },
    { id: 'stickstoff', cat: 'stoff', t: 'Stickstoff', x: 'N<sub>2</sub>', d: 'Gas, Hauptbestandteil der Luft (etwa vier Fünftel).' },
    { id: 'no2', cat: 'stoff', t: 'Stickstoffdioxid', x: 'NO<sub>2</sub>', d: 'Braunes, giftiges Gas. Steht im Gleichgewicht mit dem farblosen N<sub>2</sub>O<sub>4</sub>: 2 NO<sub>2</sub> ⇌ N<sub>2</sub>O<sub>4</sub>.', see: 'c3' },
    { id: 'thiosulfat', cat: 'stoff', t: 'Thiosulfat', x: 'Natriumthiosulfat, Na<sub>2</sub>S<sub>2</sub>O<sub>3</sub>', d: 'Reagiert mit Salzsäure, dabei entsteht Schwefel, der die Lösung trübt.', see: 'b2', m: ['Thiosulfat'] },
    { id: 'wasserstoff', cat: 'stoff', t: 'Wasserstoff', x: 'H<sub>2</sub>', d: 'Farbloses, sehr leichtes Gas. Nachweis mit der Knallgasprobe.', m: ['Wasserstoff'], w: true },
    { id: 'h2o2', cat: 'stoff', t: 'Wasserstoffperoxid', x: 'H<sub>2</sub>O<sub>2</sub>', d: 'Zerfällt zu Wasser und Sauerstoff. Wird als Bleich- und Desinfektionsmittel verwendet.', m: ['Wasserstoffperoxid'] }
  ];

  var CATS = [['abk', 'Abkürzungen'], ['symbol', 'Formelzeichen'], ['einheit', 'Einheiten'], ['zeichen', 'Zeichen und Mathe'], ['begriff', 'Fachbegriffe A–Z'], ['stoff', 'Stoffe']];
  var SEE = { a1: 'A1', a2: 'A2', b1: 'B1', b2: 'B2', b3: 'B3', c1: 'C1', c2: 'C2', c3: 'C3', tangente: 'B1', sim: 'C1', operatoren: 'Operatoren', selbstdiagnose: 'Selbstdiagnose' };
  var GI = {};
  G.forEach(function (g) { GI[g.id] = g; });
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent; }

  /* ------------------------------------------------ Suchmuster */
  var LETTER = /[A-Za-zÄÖÜäöüß]/;
  var parts = [];
  G.forEach(function (g) { (g.m || []).forEach(function (a) { parts.push({ a: a, id: g.id, w: !!g.w, ad: !!g.ad }); }); });
  parts.sort(function (x, y) { return y.a.length - x.a.length; });
  function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  var RE = new RegExp(parts.map(function (p) {
    var core = esc(p.a);
    if (p.w) core += '[a-zäöüß]*';
    else if (LETTER.test(p.a.slice(-1))) core += '(?![A-Za-zÄÖÜäöüß])';
    return '(' + core + ')';
  }).join('|'), 'g');
  var SUBMAP = { 'K|c': 'kc', 'v|hin': 'vhin', 'v|rück': 'vrueck', 'k|hin': 'khin', 'k|rück': 'krueck', 'E|A': 'ea', 'V|m': 'vm', 'N|A': 'na' };

  var SKIP = 'script,style,svg,button,a,label,input,textarea,select,output,summary,h1,h2,h3,h4,.term,.bar,.next,.seg,.gpop,.hint,#begriffe,#baustellen,#sc-tip,#tscores,.filters,.opt';
  var CONT = '.topic,.task,.block,.q,.page-head,.card,.day,.sd-row,.page';
  var seenMap = new WeakMap();
  function seenFor(node, local) {
    var c = (node.nodeType === 1 ? node : node.parentElement).closest(CONT) || document.body;
    if (local) { if (!local.has(c)) local.set(c, new Set()); return local.get(c); }
    if (!seenMap.has(c)) seenMap.set(c, new Set());
    return seenMap.get(c);
  }

  function makeTerm(id, child) {
    var s = document.createElement('span');
    s.className = 'term'; s.tabIndex = 0; s.dataset.g = id;
    s.setAttribute('role', 'button'); s.setAttribute('aria-haspopup', 'dialog'); s.setAttribute('aria-expanded', 'false');
    if (child) s.appendChild(child);
    return s;
  }

  function markSubs(root, local) {
    Array.prototype.slice.call(root.querySelectorAll('sub')).forEach(function (sub) {
      if (sub.closest(SKIP)) return;
      var prev = sub.previousSibling;
      if (!prev || prev.nodeType !== 3 || !prev.nodeValue) return;
      var tx = prev.nodeValue, id = SUBMAP[tx.slice(-1) + '|' + sub.textContent.trim()];
      if (!id) return;
      if (tx.length > 1 && LETTER.test(tx.charAt(tx.length - 2))) return;
      var seen = seenFor(sub, local);
      if (seen.has(id)) return;
      seen.add(id);
      var letter = prev.splitText(tx.length - 1);
      var term = makeTerm(id);
      sub.parentNode.insertBefore(term, letter);
      term.appendChild(letter); term.appendChild(sub);
    });
  }

  function markTextNode(node, local) {
    var text = node.nodeValue;
    if (!text || !/\S/.test(text)) return;
    var seen = seenFor(node, local), out = [], last = 0, m;
    RE.lastIndex = 0;
    while ((m = RE.exec(text))) {
      var str = m[0], start = m.index, gi = -1;
      if (!str) { RE.lastIndex++; continue; }
      for (var i = 1; i < m.length; i++) { if (m[i] !== undefined) { gi = i - 1; break; } }
      var p = parts[gi];
      if (LETTER.test(p.a.charAt(0)) && start > 0 && LETTER.test(text.charAt(start - 1))) { RE.lastIndex = start + 1; continue; }
      if (p.ad && !/\d[  ]$/.test(text.slice(Math.max(0, start - 2), start))) { RE.lastIndex = start + 1; continue; }
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      if (start > last) out.push(document.createTextNode(text.slice(last, start)));
      out.push(makeTerm(p.id, document.createTextNode(str)));
      last = start + str.length;
    }
    if (!out.length) return;
    if (last < text.length) out.push(document.createTextNode(text.slice(last)));
    var frag = document.createDocumentFragment();
    out.forEach(function (n) { frag.appendChild(n); });
    node.parentNode.replaceChild(frag, node);
  }

  function mark(root, fresh) {
    if (!root) return;
    var local = fresh ? new Map() : null;
    markSubs(root, local);
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; }
    });
    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);
    nodes.forEach(function (t) { markTextNode(t, local); });
  }

  /* ------------------------------------------------ Popover */
  var pop = document.createElement('div');
  pop.className = 'gpop'; pop.id = 'gpop'; pop.setAttribute('role', 'dialog'); pop.hidden = true;
  document.body.appendChild(pop);
  var openTerm = null;
  function hide() {
    if (openTerm) openTerm.setAttribute('aria-expanded', 'false');
    openTerm = null; pop.hidden = true;
  }
  function show(t) {
    var g = GI[t.dataset.g]; if (!g) return;
    if (openTerm) openTerm.setAttribute('aria-expanded', 'false');
    pop.innerHTML = '<p class="gpop-t">' + g.t + (g.x ? '<span>' + g.x + '</span>' : '') + '</p>' +
      '<p class="gpop-d">' + g.d + '</p>' +
      (g.e ? '<p class="gpop-e">Beispiel: ' + g.e + '</p>' : '') +
      '<p class="gpop-l"><a href="#g-' + g.id + '">Im Glossar ansehen</a>' + (g.see ? '<a href="#' + g.see + '">Mehr bei ' + SEE[g.see] + '</a>' : '') + '</p>';
    pop.hidden = false;
    var vw = document.documentElement.clientWidth, pw = Math.min(352, vw - 32);
    pop.style.width = pw + 'px';
    var r = t.getBoundingClientRect();
    var left = Math.min(Math.max(16, r.left), vw - pw - 16);
    var top = r.bottom + 8, ph = pop.offsetHeight;
    if (top + ph > window.innerHeight - 8 && r.top - 8 - ph > 0) top = r.top - 8 - ph;
    pop.style.left = (left + window.scrollX) + 'px';
    pop.style.top = (top + window.scrollY) + 'px';
    openTerm = t; t.setAttribute('aria-expanded', 'true');
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('.term');
    if (t) { ev.preventDefault(); if (openTerm === t) hide(); else show(t); return; }
    if (!ev.target.closest || !ev.target.closest('.gpop')) hide();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { var o = openTerm; hide(); if (o) o.focus(); return; }
    var t = ev.target.closest && ev.target.closest('.term');
    if (t && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); if (openTerm === t) hide(); else show(t); }
  });
  window.addEventListener('resize', hide);

  /* ------------------------------------------------ Glossar-Seite */
  var root = document.getElementById('gl-root');
  function entry(g) {
    return '<div class="gl" id="g-' + g.id + '"><div class="gl-t">' + g.t + (g.x ? '<span class="gl-x">' + g.x + '</span>' : '') + '</div>' +
      '<div class="gl-d">' + g.d + (g.e ? '<span class="gl-e">Beispiel: ' + g.e + '</span>' : '') +
      (g.see ? ' <a class="gl-see" href="#' + g.see + '">→ ' + SEE[g.see] + '</a>' : '') + '</div></div>';
  }
  if (root) {
    root.innerHTML = CATS.map(function (c) {
      var items = G.filter(function (g) { return g.cat === c[0]; });
      if (c[0] === 'begriff' || c[0] === 'stoff') items.sort(function (a, b) { return strip(a.t).localeCompare(strip(b.t), 'de'); });
      return '<div class="gl-group" data-cat="' + c[0] + '"><h2>' + c[1] + ' <span class="gl-n">' + items.length + '</span></h2><div class="gl-list">' + items.map(entry).join('') + '</div></div>';
    }).join('');
    G.forEach(function (g) {
      var el = document.getElementById('g-' + g.id);
      if (el) el.dataset.s = (strip(g.t) + ' ' + strip(g.x || '') + ' ' + strip(g.d) + ' ' + (g.m || []).join(' ')).toLowerCase();
    });
    var q = document.getElementById('gl-q'), cnt = document.getElementById('gl-count');
    var filter = function () {
      var v = q.value.trim().toLowerCase(), shown = 0;
      Array.prototype.slice.call(root.querySelectorAll('.gl-group')).forEach(function (grp) {
        var any = 0;
        Array.prototype.slice.call(grp.querySelectorAll('.gl')).forEach(function (e) {
          var ok = !v || e.dataset.s.indexOf(v) >= 0;
          e.hidden = !ok; if (ok) any++;
        });
        grp.hidden = !any; shown += any;
      });
      cnt.textContent = v ? shown + ' Treffer' : G.length + ' Einträge';
      var none = document.getElementById('gl-none');
      if (!shown && !none) { none = document.createElement('p'); none.id = 'gl-none'; none.className = 'muted'; root.appendChild(none); }
      if (none) { none.hidden = !!shown; none.textContent = 'Nichts gefunden. Versuche einen kürzeren Suchbegriff.'; }
    };
    q.addEventListener('input', filter);
    filter();
    window.addEventListener('hashchange', function () {
      hide();
      if (location.hash.indexOf('#g-') === 0 && q.value) { q.value = ''; filter(); }
    });
  }

  /* ------------------------------------------------ Hinweis auf jeder Seite */
  Array.prototype.slice.call(document.querySelectorAll('.page-head')).forEach(function (h) {
    if (h.closest('#begriffe')) return;
    var p = document.createElement('p');
    p.className = 'hint';
    p.innerHTML = '<span class="demo">Gepunktet unterstrichene</span> Wörter kannst du antippen, dann erscheint eine Erklärung. Alle Begriffe stehen unter <a href="#begriffe">Begriffe</a>.';
    h.appendChild(p);
  });

  window.Begriffe = { markAll: function () { mark(document.querySelector('main')); }, mark: mark, hide: hide };
})();
