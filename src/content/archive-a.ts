import type { ArchiveEntry } from "@/lib/domain/types";

/**
 * Archive, part A: history and geography, plus Bretton Woods.
 * Ids are the canonical concept keys (CONTRACTS §8).
 * Prose is editorial; where a date or figure is contested the text says so.
 */
export const ARCHIVE_A: ArchiveEntry[] = [
  {
    id: "printing-press",
    kind: "technology",
    domain: "history",
    title: "The Printing Press",
    subtitle: "Movable metal type and the industrialisation of the word",
    summary:
      "Johannes Gutenberg's press, working in Mainz by the early 1450s, made the copying of text a manufacturing process rather than a craft, and within fifty years had changed what it cost to be heard in Europe.",
    what:
      "Printing with movable type was not a European invention. Bi Sheng had used ceramic type in Song China around 1040, and the Korean Jikji of 1377 is the oldest surviving book printed with metal type. What Gutenberg assembled in Mainz around 1450 was a system: a hand mould that cast identical letters quickly from a lead-tin-antimony alloy, an oil-based ink that adhered to metal, and a screw press adapted from the wine and paper trades. The combination made a page reproducible at speed and, crucially, at a price a merchant could pay.\n\nHis 42-line Bible, finished around 1455, was the proof. Within a decade presses had reached Strasbourg, Cologne, Rome and Venice; by 1500 there were presses in roughly 250 European towns. The commonly cited figure of some twenty million volumes printed before 1500 comes from Febvre and Martin and is an estimate, not a count, but the order of magnitude is not in doubt.\n\nThe historian Elizabeth Eisenstein argued in 1979 that print created a fixed, cumulative record that made the Reformation and the scientific revolution possible. Adrian Johns and others have replied that early print was unreliable, pirated and contested, and that fixity was earned by institutions rather than granted by the machine. Both are partly right: the press lowered the cost of copying, and what people did with cheap copies is a separate history.",
    why:
      "The press matters because it is the clearest case of a technology whose cheapness, rather than its novelty, did the work. Ideas that had circulated among a few hundred clerics could be argued over by tens of thousands of townspeople within weeks. Once you see that pattern, you see it again in the telegraph, the photocopier and the internet: the decisive question is never whether a thing can be copied but what it costs to copy it, and who is on the receiving end.",
    before:
      "Books were copied by hand in monasteries and, from the thirteenth century, by professional scribes serving universities and courts. A well-stocked library held a few hundred volumes; a Bible took a scribe more than a year. Paper, which had reached Europe through the Islamic world and Spain, was already cheaper than parchment, and block printing of single sheets was known. The demand was there; the bottleneck was the hand.",
    after:
      "Within two generations a market for cheap pamphlets, almanacs, indulgences and vernacular scripture existed. Martin Luther's tracts sold in hundreds of thousands; a debate about salvation became a mass event. Standardised editions of Euclid, Ptolemy and Galen let scholars in different cities argue about the same page. Censorship was invented in its modern form, with the Index of Prohibited Books from 1559. In the Ottoman lands printing in Arabic script was not licensed for Muslims until Ibrahim Müteferrika's press in 1727, though Jewish, Armenian and Greek presses had operated in Istanbul much earlier, a reminder that adoption is a political choice, not an automatic consequence.",
    connects:
      "The press is the engine behind The Reformation and the diffusion of The Renaissance beyond Italy. It sits in the same family as Double-Entry Bookkeeping and Containerization: unglamorous techniques that cut the cost of a routine operation and rearranged everything downstream. Its slow arrival in The Ottoman Empire is one strand in the long argument about why Europe and the Islamic world diverged.",
    remember: [
      "Gutenberg's contribution was a system (hand mould, oil ink, screw press), not the idea of movable type, which is Chinese and Korean.",
      "The 42-line Bible dates to about 1455; presses were in roughly 250 European towns by 1500.",
      "The decisive variable was the cost of a copy, not the existence of copying.",
      "Eisenstein (print creates fixity) versus Johns (fixity was earned by institutions) is the live scholarly debate.",
      "Adoption was political: Arabic-script printing for Muslims in the Ottoman Empire waited until 1727.",
    ],
    yearStart: 1450,
    yearEnd: 1500,
    location: { lat: 49.99, lon: 8.27, country: "Germany" },
    tags: ["technology", "gutenberg", "print", "reformation", "information", "books", "mainz"],
    recall: [
      { prompt: "What three elements did Gutenberg combine into a working printing system?", answer: "A hand mould for casting identical metal type, an oil-based ink that adhered to metal, and a screw press adapted from wine and paper presses." },
      { prompt: "Roughly how many European towns had a press by 1500?", answer: "About 250." },
      { prompt: "Who invented movable type, and when?", answer: "Bi Sheng in Song China around 1040 (ceramic type); the Korean Jikji of 1377 is the oldest surviving book printed with metal type." },
      { prompt: "State the Eisenstein-Johns disagreement in one sentence.", answer: "Eisenstein held that print itself created a fixed, cumulative record; Johns argued that early print was unreliable and that fixity was built by institutions and practices over time." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "rosetta-stone",
    kind: "object",
    domain: "history",
    title: "The Rosetta Stone",
    subtitle: "A tax decree that unlocked a dead script",
    summary:
      "A granodiorite slab inscribed in 196 BCE with the same priestly decree in hieroglyphic, Demotic and Greek, found by French soldiers in 1799 and used by Young and Champollion to decipher Egyptian writing.",
    what:
      "The stone records a decree issued at Memphis in 196 BCE by a council of priests confirming the cult of the young king Ptolemy V, granting tax remissions and ordering that the text be set up in every major temple in three scripts: hieroglyphs, the sacred script; Demotic, the everyday script; and Greek, the language of the Ptolemaic administration. It is, in other words, an ordinary piece of state communication, of a kind that was probably erected many times over. Its importance is entirely accidental.\n\nFrench soldiers rebuilding a fort near Rashid (Rosetta) in the Nile Delta uncovered it in July 1799 during Napoleon's Egyptian expedition. An officer, Pierre-François Bouchard, recognised its value. Under the Capitulation of Alexandria in 1801 the stone passed to the British along with other antiquities collected by the French, and it has been in the British Museum since 1802.\n\nDecipherment took two decades. Thomas Young established that the oval cartouches contained royal names and assigned sound values to several signs. Jean-François Champollion, drawing on Coptic, the late descendant of Egyptian, showed in 1822 that hieroglyphs were a mixed system: some signs phonetic, some ideographic, some determinatives indicating category. His Lettre à M. Dacier is usually treated as the moment the script was broken, though the full grammar took years more.",
    why:
      "The stone is a lesson in what a known-plaintext gives you. The Greek could be read; the problem was to map an unknown system onto a known one, and the mapping only worked once Champollion abandoned the assumption that pictures meant things and allowed that they could also mean sounds. It is also a lesson in ownership: an object found by one empire, taken by a second, from a country ruled by a third, now sits at the centre of a live argument about where such things belong.",
    before:
      "Knowledge of hieroglyphic writing was lost by late antiquity; the last dated inscription is from 394 CE at Philae. Renaissance and Baroque scholars, following the Greek writer Horapollo, treated the signs as pure allegory, which sent decipherment down a blind alley for three centuries. The Egyptian language survived only in Coptic liturgy, which turned out to be the key nobody had turned.",
    after:
      "Egyptology became a discipline with texts, not just monuments. Kings lists, tax records, letters and medical papyri became readable, and Egypt's chronology could be anchored. The stone also became a metaphor for any key that unlocks a code, which is why the name is borrowed for language software and for the ESA comet mission. Egypt has requested its return since 2003; the museum has declined, and the question of legal title under the 1801 capitulation remains disputed.",
    connects:
      "The stone was found because of Napoleon Bonaparte's expedition and taken because of his defeat there. Its decipherment belongs to the same habit of mind as Bayes' Theorem and Falsifiability: form a hypothesis about the mapping, test it against every cartouche you can find, discard it when it fails. The Suez Canal sits in the same Delta, in the same strategic argument between France and Britain.",
    remember: [
      "196 BCE, decree of Memphis for Ptolemy V, in hieroglyphic, Demotic and Greek.",
      "Found July 1799 near Rashid by French soldiers; British since 1801; British Museum since 1802.",
      "Young found the cartouches held royal names; Champollion (1822) showed the script mixed sound signs and sense signs, using Coptic as the bridge.",
      "The blind alley was the assumption that hieroglyphs were allegorical pictures.",
    ],
    yearStart: -196,
    yearEnd: 1822,
    location: { lat: 31.4, lon: 30.42, country: "Egypt" },
    tags: ["egypt", "decipherment", "hieroglyphs", "language", "archaeology", "champollion", "museum", "restitution"],
    recall: [
      { prompt: "What are the three scripts on the Rosetta Stone, and why three?", answer: "Hieroglyphic (sacred), Demotic (everyday Egyptian) and Greek (the Ptolemaic administration's language); the decree was to be readable by priests, people and state." },
      { prompt: "What was Champollion's decisive insight in 1822?", answer: "That hieroglyphs are a mixed system of phonetic signs, ideograms and determinatives, not pure pictures; Coptic gave him the sound values." },
      { prompt: "How did the stone pass from French to British hands?", answer: "Under the Capitulation of Alexandria in 1801, after the French defeat in Egypt." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "ottoman-empire",
    kind: "institution",
    domain: "history",
    title: "The Ottoman Empire",
    subtitle: "Six centuries of a state that ran three continents from the Bosporus",
    summary:
      "From a frontier principality in northwest Anatolia around 1300 to a world power that took Constantinople in 1453 and reached Vienna, the Ottoman state lasted until 1922 and left the political map of the Balkans and the Middle East.",
    what:
      "The Ottomans began as one of several Turkish frontier lordships in Anatolia after the Seljuk collapse; 1299 is the traditional founding date under Osman I, but no contemporary document fixes it. They crossed into Europe in the 1350s, absorbed Bulgaria and Serbia, survived defeat by Timur at Ankara in 1402, and under Mehmed II took Constantinople in May 1453 after a siege of fifty-three days. Selim I added Syria, Egypt and the Hijaz in 1516–17; Suleiman I (1520–66) took Belgrade, Rhodes, most of Hungary, and besieged Vienna in 1529.\n\nThe state's strength was administrative. Land was held as timar grants in exchange for cavalry service; the devshirme levy took Christian boys from the Balkans and trained them as Janissaries and officials, producing a ruling class loyal to the sultan rather than to noble families. Religious communities ran their own courts and schools, an arrangement later called the millet system, though historians now argue that the neat, formal version of it was an invention of the nineteenth century.\n\nThe old story of steady decline after Suleiman is no longer accepted. The seventeenth century brought crisis and adaptation rather than collapse; the second failed siege of Vienna in 1683 and the Treaty of Karlowitz in 1699 marked the loss of Hungary but not of the state. The Tanzimat reforms of 1839–76 rebuilt the army, law and bureaucracy on European models. Defeat in the First World War and the nationalist movement under Mustafa Kemal ended the sultanate in 1922; the caliphate followed in 1924.",
    why:
      "The Ottoman case corrects two lazy habits: the assumption that a multi-ethnic, multi-confessional state must be fragile, and the assumption that a state which loses territory is in decline. It lasted longer than most European monarchies while governing Arabs, Greeks, Slavs, Armenians, Jews and Turks. Its final borders, drawn at Lausanne in 1923 and by the mandates carved from its Arab provinces, are the borders whose problems fill today's news.",
    before:
      "Anatolia in 1300 was a patchwork: a shrunken Byzantium, Mongol-dominated Seljuk remnants, and a dozen Turkish beyliks competing for the frontier. The Balkans were divided among Serbian, Bulgarian and Byzantine rulers weakened by the Black Death and civil war. Nobody looking at Osman's small principality near Bursa would have picked it as the survivor.",
    after:
      "The Republic of Turkey took the Anatolian core; the Arab provinces became British and French mandates, then the states of Iraq, Syria, Lebanon, Jordan, Palestine and Israel. Ottoman law, cuisine, architecture and administrative vocabulary persist from Sarajevo to Baghdad. The word 'Ottoman' itself has become shorthand in Turkish politics for an imperial past that some wish to reclaim and others to leave behind.",
    connects:
      "Istanbul was the empire's capital and the Bosporus its inner harbour. The empire fought The Venetian Republic for the eastern Mediterranean for three centuries, inherited the Silk Road's western terminals, and gave its name to the Ottoman coffeehouse that Coffeehouses in London and Vienna copied. Its slow adoption of The Printing Press is a set piece in debates about technological divergence, and its dissolution is the backdrop to the Suez Canal's strategic history.",
    remember: [
      "Traditional founding 1299 (uncertain); Constantinople taken 1453; sultanate abolished 1922.",
      "Timar land grants and the devshirme levy produced an army and bureaucracy loyal to the sultan, not to a hereditary nobility.",
      "The 'millet system' as a formal structure is largely a nineteenth-century construction.",
      "The 'decline after Suleiman' narrative is rejected by most current historians; 1683 and 1699 were setbacks, not collapse.",
      "Modern borders in the Balkans and Middle East are Ottoman partition lines.",
    ],
    yearStart: 1299,
    yearEnd: 1922,
    location: { lat: 41.01, lon: 28.98, country: "Türkiye" },
    tags: ["empire", "turkey", "anatolia", "balkans", "middle east", "islam", "constantinople", "state"],
    recall: [
      { prompt: "What were the timar and the devshirme?", answer: "Timar: a revocable land grant given in exchange for cavalry service. Devshirme: a periodic levy of Christian boys from the Balkans trained as Janissaries and officials." },
      { prompt: "Why is the 'decline after Suleiman' story now rejected?", answer: "Because the seventeenth century shows crisis and adaptation rather than collapse; the state lost Hungary after 1683 and 1699 but reformed and endured for two more centuries." },
      { prompt: "When did the Ottomans take Constantinople, and under whom?", answer: "May 1453, under Mehmed II, after a fifty-three-day siege." },
      { prompt: "What is contested about the 'millet system'?", answer: "Whether it existed as a formal, uniform structure before the nineteenth century; earlier arrangements were looser and more local." },
    ],
    readingMinutes: 7,
    origin: "seeded",
  },
  {
    id: "venetian-republic",
    kind: "institution",
    domain: "history",
    title: "The Venetian Republic",
    subtitle: "A merchant state that outlived every rival for a thousand years",
    summary:
      "From a refuge in the lagoon to the dominant naval and commercial power of the eastern Mediterranean, Venice was governed by an elected doge and a closed patrician council from the late seventh century until Napoleon dissolved it in 1797.",
    what:
      "Venice grew from settlements on the lagoon islands, sheltered from the mainland invasions of the sixth and seventh centuries. The first doge is traditionally dated to 697, though the earliest secure records are a century later. Nominally subject to Byzantium, the city became independent in practice and built its wealth on salt, then on carrying eastern goods, spices, silk, cotton and alum, to northern Europe.\n\nIts institutions are the point. The doge was elected for life but hemmed in by councils; from the Serrata of 1297 the Great Council was closed to a fixed set of patrician families, and from 1310 the Council of Ten handled state security. The result was a republic without a king, a court or an effective nobility of land, run by merchants who audited one another. The Arsenal, a state shipyard employing thousands, could fit out a galley in a day. The colleganza contract let small investors fund voyages, an early form of limited-risk finance.\n\nVenice diverted the Fourth Crusade to sack Constantinople in 1204 and took much of the Byzantine coastline. It fought Genoa to exhaustion in the fourteenth century, lost the Peloponnese and much of the Aegean to the Ottomans, and saw Portuguese ships reach India in 1498, which threatened its spice monopoly, though the Levant trade recovered in the mid-sixteenth century. Lepanto in 1571 was a shared Christian victory that changed little. By the eighteenth century the republic was a place of theatres and carnival, and it surrendered to Napoleon without a battle in May 1797.",
    why:
      "Venice is the standing example of institutions outlasting circumstances. Its geography was a liability for a farmer and an asset for a trader; its constitution made betrayal expensive and succession boring, which is what a merchant state wants. It is also the standing example of a monopoly that was not lost to a rival but to a route: no one defeated Venice at sea; the Cape simply made its sea less important.",
    before:
      "Before Venice, the Adriatic and Aegean were Byzantine waters, and long-distance trade with the East ran through Constantinople and Alexandria under imperial control. The lagoon was a marsh with fishermen and salt pans, worth nothing to a land army and therefore safe.",
    after:
      "Austria, then the Kingdom of Italy, inherited the city. The republic's paper legacy is larger than its stone one: the ducat as a stable coin from 1284, the sequin, marine insurance, state debt traded as securities, the printing industry of Aldus Manutius, and the glass and lace crafts still practised in the lagoon. The idea of a stable oligarchic republic shaped later constitutional thinkers, from Harrington to the American founders.",
    connects:
      "Venice's rise and fall are entangled with The Ottoman Empire, its enemy and its trading partner, and with the Silk Road, whose goods it carried west. Its merchants used Double-Entry Bookkeeping, which Pacioli published in Venice in 1494, and its presses spread The Renaissance. The Dutch East India Company is in many ways the Venetian model rebuilt around a joint-stock company and a different ocean.",
    remember: [
      "Traditional first doge 697; the republic ended in May 1797 when it surrendered to Napoleon.",
      "The Serrata of 1297 closed the Great Council to a fixed patriciate; the Council of Ten (1310) handled security.",
      "The Arsenal was a state shipyard; the colleganza let small investors fund voyages with limited risk.",
      "The Fourth Crusade (1204) gave Venice a maritime empire at Byzantium's expense.",
      "The Portuguese route to India (1498) threatened, but did not immediately destroy, the spice trade.",
    ],
    yearStart: 697,
    yearEnd: 1797,
    location: { lat: 45.44, lon: 12.33, country: "Italy" },
    tags: ["venice", "republic", "trade", "mediterranean", "maritime", "oligarchy", "institutions", "commerce"],
    recall: [
      { prompt: "What was the Serrata of 1297?", answer: "The closing of the Great Council to a fixed set of patrician families, which turned Venice into a hereditary oligarchy governed by law." },
      { prompt: "What ended Venice's commercial supremacy: a rival, or something else?", answer: "A route. The Portuguese sea route to India (1498) and later Atlantic trade made the Mediterranean less central; the Levant trade recovered for a while but the centre of gravity had moved." },
      { prompt: "How did the Fourth Crusade benefit Venice?", answer: "Venice diverted it to sack Constantinople in 1204 and took key Byzantine ports and islands, building a maritime empire." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "silk-road",
    kind: "concept",
    domain: "history",
    title: "The Silk Road",
    subtitle: "A nineteenth-century name for a two-thousand-year network",
    summary:
      "Not a road but a shifting web of overland and maritime routes linking China, Central Asia, India, Persia and the Mediterranean, along which goods, religions, technologies and diseases moved from roughly the second century BCE to the fifteenth century.",
    what:
      "The phrase was coined in 1877 by the German geographer Ferdinand von Richthofen as Seidenstraße, and it has misled ever since. There was no single road, silk was only one commodity, and very few people travelled the whole length. What existed was a chain of regional markets, oasis cities and mountain passes across which goods changed hands many times: Chang'an to Dunhuang, through the Tarim Basin to Kashgar, over the Pamirs to Samarkand and Merv, then on to Persia, Syria and the ports of the Levant.\n\nThe overland routes gained importance after the Han envoy Zhang Qian's missions to the west around 138–126 BCE and the Han push into the Tarim. Sogdian merchants from around Samarkand dominated the middle stretch for centuries; their letters, found near Dunhuang, show a trading diaspora managing credit and family across thousands of kilometres. Chinese silk reached Rome; Roman glass, Persian silver, Indian cotton and Central Asian horses moved the other way. Paper travelled west; Buddhism, Manichaeism, Nestorian Christianity and Islam travelled along the same paths.\n\nThe routes flourished under the Tang, contracted afterwards, and revived under the Mongols, when a single authority stretched from Korea to Hungary. Their decline is often blamed on the Ottomans blocking the way, a claim modern historians reject: maritime routes had always carried more bulk, and the Portuguese and Dutch sea trade simply made the caravans marginal.",
    why:
      "The Silk Road is the best case study in how connection works without anyone designing it. No empire ran it end to end; it was a market of markets, held together by relay traders, shared credit and tolerated strangers. It also carried plague, which is the part the romantic version leaves out. Understanding it means understanding that trade, faith and disease use the same infrastructure.",
    before:
      "Before the Han opened the Tarim corridor, exchange across Central Asia was real but thin: nomadic peoples moved horses, jade and bronze between the steppe and the settled world, and Achaemenid Persia's Royal Road ran only as far east as its own frontier. The Hellenistic kingdoms left by Alexander in Bactria provided a Greek-speaking bridge into India.",
    after:
      "Maritime trade around the Cape and later through the Suez Canal replaced the caravans for bulk goods, though regional overland trade never stopped. The name was revived in the twentieth century as a romantic brand and, since 2013, as the label for China's Belt and Road Initiative, which deliberately invokes the old routes while building rail, port and pipeline links on quite different geography.",
    connects:
      "The Mongol Empire gave the routes their one period of single ownership. The Venetian Republic and The Ottoman Empire were the western terminals; The Black Death almost certainly travelled the same paths west in the 1340s. The Ming Dynasty's maritime voyages and later sea bans reshaped the eastern end, and the Suez Canal completed the shift from caravan to ship.",
    remember: [
      "The name is from Richthofen in 1877; there was no single road and no end-to-end traders.",
      "Zhang Qian's missions around 138–126 BCE and Han control of the Tarim opened the overland corridor.",
      "Sogdian merchants ran the middle stretch; paper, religions and plague moved alongside silk, glass and horses.",
      "The Mongol period (thirteenth century) was the high point of overland connection.",
      "The 'Ottomans blocked it' story is a myth; sea routes always carried more and eventually took over.",
    ],
    yearStart: -130,
    yearEnd: 1450,
    tags: ["trade", "central asia", "china", "caravan", "exchange", "sogdian", "samarkand", "networks"],
    recall: [
      { prompt: "Who coined the term 'Silk Road', and why is it misleading?", answer: "Ferdinand von Richthofen in 1877. There was no single road, silk was one good among many, and most trade was relayed between regional markets." },
      { prompt: "Which merchant people dominated the central stretch of the routes for centuries?", answer: "The Sogdians, from the region around Samarkand and Bukhara." },
      { prompt: "Did the Ottomans close the Silk Road?", answer: "No. Sea routes had long carried more bulk trade; the Portuguese and Dutch ocean routes made the caravans marginal." },
      { prompt: "Name three non-commercial things that travelled the routes.", answer: "Religions (Buddhism, Nestorian Christianity, Islam), technologies (paper), and disease (the plague of the 1340s)." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "renaissance",
    kind: "movement",
    domain: "history",
    title: "The Renaissance",
    subtitle: "The recovery of antiquity and the invention of the modern eye",
    summary:
      "A cultural movement beginning in fourteenth-century Italy that rebuilt scholarship, art and political thought on recovered classical models, and whose very name is a nineteenth-century judgement about what came before it.",
    what:
      "The Renaissance began as a programme of reading. Petrarch, in the mid-1300s, hunted for lost manuscripts of Cicero and Livy and taught a generation to write Latin as the Romans had. The humanists who followed him treated grammar, rhetoric, history, poetry and moral philosophy as the education of a free citizen. When Manuel Chrysoloras began teaching Greek in Florence in 1397, and when more Greek scholars and books arrived before and after the fall of Constantinople in 1453, Plato, Homer and the Greek mathematicians came within reach.\n\nFlorence was the centre because it was rich, republican and competitive. Its bankers, above all the Medici, paid for the work; its guilds commissioned Ghiberti's doors and Brunelleschi's dome, completed in 1436 without centring, a structural feat no one had matched since Rome. Alberti wrote the rules of linear perspective in 1435; Masaccio, Donatello, Botticelli, then Leonardo, Michelangelo and Raphael made a visual language that Europe copied for four hundred years. Machiavelli's Prince, written in 1513, read politics with the same cold classical eye.\n\nThe label is Jacob Burckhardt's, from 1860. He saw in Italy the birth of the individual and the modern state. Medievalists have objected ever since: the twelfth century had its own renaissance of Aristotle and law; most Italians in 1500 lived as their grandparents had; and the movement was narrower, more religious and more masculine than the Victorian picture. The dates, roughly 1350 to 1600, are a convenience.",
    why:
      "The Renaissance is worth knowing as a method, not a museum. Its central move was to go back to the source, compare copies, and correct the received text. Lorenzo Valla used philology to prove the Donation of Constantine a forgery in 1440, which is the same act as fact-checking a quotation. The perspective grid, the audited manuscript and the dissected body are one habit: look at the thing itself.",
    before:
      "The century before was the century of the Black Death, of papal schism and mercenary wars. Scholasticism had built a magnificent system on Aristotle, but knowledge of Greek was rare in the Latin West and much of the classical inheritance survived only in Byzantine and Arabic libraries. Italian cities, however, were unusually rich, literate and urban, with lawyers and notaries who already valued Latin style.",
    after:
      "The movement crossed the Alps with print and diplomacy: Erasmus, Dürer, Montaigne, the Tudor court. Humanist textual criticism, applied to scripture, fed The Reformation; the recovery of Archimedes and Ptolemy fed Copernicus and Galileo. The Council of Trent and the Counter-Reformation absorbed Renaissance art into a new devotional programme, the Baroque. The word became a general noun for any revival, which has drained it of precision.",
    connects:
      "The Printing Press turned a Florentine conversation into a European one. The Venetian Republic supplied the presses and the ports; The Ottoman Empire's capture of Constantinople pushed Greek scholars westward. The Reformation is the movement's quarrelsome child, and Johann Sebastian Bach and Impressionism belong to the long afterlife of its idea that an artist is an individual with a signature.",
    remember: [
      "It began as a textual programme: Petrarch and the humanists recovering and correcting classical Latin and, from 1397, Greek.",
      "Florence: Brunelleschi's dome (1436), Alberti's perspective (1435), Medici patronage.",
      "Burckhardt coined the modern concept in 1860; medievalists have contested his 'birth of the individual' ever since.",
      "Valla's exposure of the Donation of Constantine (1440) shows the method: go to the source and check.",
      "Dates of c. 1350–1600 are a convention, not a boundary.",
    ],
    yearStart: 1350,
    yearEnd: 1600,
    location: { lat: 43.77, lon: 11.25, country: "Italy" },
    tags: ["florence", "humanism", "art", "italy", "classical", "medici", "perspective", "culture"],
    recall: [
      { prompt: "What was the first activity of the Renaissance, before painting?", answer: "Recovering, comparing and correcting classical texts; Petrarch's manuscript hunting and humanist philology." },
      { prompt: "Who invented the modern concept of 'the Renaissance', and what is the main objection?", answer: "Jacob Burckhardt in 1860. Medievalists object that the twelfth century had its own revival and that the 'birth of the individual' overstates the break." },
      { prompt: "What did Lorenzo Valla prove in 1440, and how?", answer: "That the Donation of Constantine was a forgery, by showing its Latin belonged to a later century." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "the-reformation",
    kind: "movement",
    domain: "history",
    title: "The Reformation",
    subtitle: "A theological quarrel that split Western Christendom and redrew Europe",
    summary:
      "Beginning with Luther's challenge to indulgences in 1517, the Reformation broke the religious unity of Western Europe, created the Protestant churches, and set off a century of wars that ended only at Westphalia in 1648.",
    what:
      "In October 1517 Martin Luther, an Augustinian friar and professor at Wittenberg, circulated ninety-five theses against the sale of indulgences. Whether he nailed them to the church door is uncertain; that they were printed and read across Germany within weeks is not. His deeper claims followed fast: that salvation comes by faith alone, that scripture outranks the papacy, and that every believer is a priest. Excommunicated in 1521 and outlawed at the Diet of Worms, he was sheltered by the Elector of Saxony and translated the New Testament into German.\n\nThe movement fragmented at once. Zwingli in Zurich and Calvin in Geneva built stricter, more republican churches; Anabaptists rejected infant baptism and, at Münster in 1534–35, tried to build a kingdom of God; Henry VIII's Act of Supremacy of 1534 made the English church a matter of state. Princes and city councils chose sides for reasons of conscience, revenue and independence from Rome in proportions that historians still argue about.\n\nThe Catholic Church answered with the Council of Trent (1545–63), the Jesuits and the Index, a reform-and-repression programme once called the Counter-Reformation and now often the Catholic Reformation. The Peace of Augsburg in 1555 let each German prince choose Lutheranism or Catholicism for his territory; the formula failed to include Calvinists, and the Thirty Years' War of 1618–48 was in part the bill for that omission.",
    why:
      "The Reformation is the clearest example of a technical dispute, about the mechanics of forgiveness, becoming a political revolution because a medium (print) and a constituency (literate townspeople and ambitious princes) were ready for it. It also shows what happens when a shared authority collapses: everyone claims the text, and no arbiter is left. Modern arguments about who decides what is true are running on the same rails.",
    before:
      "Calls for reform were old: Wycliffe in England, Hus in Bohemia (burned 1415), conciliarists who wanted councils above popes. Renaissance humanism, especially Erasmus's Greek New Testament of 1516, had made scripture a text to be checked. The papacy was rich, Italian and building St Peter's; indulgences funded it. The grievance and the tools were both in place; Luther supplied the occasion.",
    after:
      "Europe divided along lines that mostly still hold: Lutheran Scandinavia and north Germany, Calvinist Netherlands and Scotland, Anglican England, Catholic south. Literacy rose where reading scripture was a duty. The claim that Protestantism produced capitalism (Weber, 1905) is influential and contested. Persecution and religious war drove migrations, including the Puritans to New England. The idea that faith is a private matter which the state should tolerate emerged slowly from exhaustion rather than principle.",
    connects:
      "The Printing Press is the movement's precondition; The Renaissance supplied the philology that read scripture anew. The Peace of Westphalia settled the wars the Reformation began. The Dutch East India Company was founded by a Calvinist republic born in revolt against Catholic Spain, and Johann Sebastian Bach wrote his cantatas for Luther's church.",
    remember: [
      "1517: Luther's ninety-five theses on indulgences; printed and spread within weeks (the nailing is uncertain).",
      "Core claims: faith alone, scripture alone, priesthood of all believers.",
      "Branches: Lutheran, Reformed (Zwingli, Calvin), Anabaptist, Anglican (1534).",
      "Catholic response: Council of Trent (1545–63), Jesuits, Index.",
      "Augsburg 1555 excluded Calvinists; the Thirty Years' War and Westphalia (1648) finished the settlement.",
    ],
    yearStart: 1517,
    yearEnd: 1648,
    location: { lat: 51.87, lon: 12.65, country: "Germany" },
    tags: ["luther", "protestant", "religion", "church", "calvin", "wittenberg", "schism", "theology"],
    recall: [
      { prompt: "What is uncertain and what is certain about the ninety-five theses of 1517?", answer: "Uncertain: whether Luther nailed them to the Wittenberg church door. Certain: they were printed and spread across Germany within weeks." },
      { prompt: "What did the Peace of Augsburg (1555) decide, and what did it omit?", answer: "Each German prince could choose Lutheranism or Catholicism for his territory; it omitted Calvinists, a gap that fed the Thirty Years' War." },
      { prompt: "Name the three main institutional responses of the Catholic Church.", answer: "The Council of Trent (1545–63), the Jesuit order, and the Index of Prohibited Books." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "black-death",
    kind: "event",
    domain: "history",
    title: "The Black Death",
    subtitle: "The pandemic that killed a third of Europe and repriced labour",
    summary:
      "Between 1346 and 1353 plague spread from the Black Sea across the Mediterranean and Europe, killing somewhere between a third and a half of the population and setting off changes in wages, land, religion and medicine that lasted centuries.",
    what:
      "The disease was plague, caused by the bacterium Yersinia pestis; this was disputed for decades until ancient DNA from mass graves settled it around 2010–11. Its origin lies in Central Asia: a 2022 study of tombstones from the Chüy Valley in modern Kyrgyzstan, dated 1338–39, found the ancestral strain. It reached the Genoese port of Caffa in Crimea in 1346, allegedly when a Mongol army catapulted corpses over the walls, a story told by one notary who was not there, and arrived at Messina by ship in October 1347. By 1348 it was in Florence, Marseille, Paris and southern England; by 1350 in Scandinavia; by 1353 in Russia.\n\nMortality figures are estimates from tax rolls, manorial records and wills. Thirty to fifty per cent of Europe's population is the usual range; some historians argue for higher, and towns and monasteries often lost more. The Islamic world suffered comparably; Cairo may have lost a third of its people. Bubonic transmission via rats and fleas is the classic model, but the speed of spread has led some to argue that human fleas and lice, and pneumonic transmission, mattered more.\n\nResponses ranged from quarantine (Ragusa's thirty-day isolation of ships in 1377, later forty, hence the word) to flagellant processions and massacres of Jewish communities accused of poisoning wells, notably at Strasbourg in February 1349. The plague returned in waves for three centuries.",
    why:
      "The Black Death is the largest natural experiment in economic history. Cut a labour force in half and leave the land and capital intact, and you find out what workers are worth: wages rose, rents fell, serfdom loosened in the West, and rulers tried to legislate wages back down (England's Statute of Labourers, 1351) and failed. It also teaches how societies reason under terror: the same evidence produced quarantine in one city and pogroms in another.",
    before:
      "Europe around 1300 was crowded. Population had roughly tripled since the year 1000, marginal land was under the plough, and the Great Famine of 1315–17 had already shown how thin the margin was. Medicine followed Galen and blamed corrupt air; there was no concept of contagion by organism, though the practical idea of isolating the sick existed.",
    after:
      "The survivors were richer per head. Labour scarcity encouraged labour-saving devices and, some argue, the eventual mechanical experiments of the fifteenth century. Peasant revolts followed in France (1358) and England (1381). Art turned to the macabre, the Dance of Death and the transi tomb. Public health as a function of the state, with boards of health, quarantine stations and bills of mortality, is a direct descendant.",
    connects:
      "The pathogen travelled the Silk Road under the Mongol Empire's peace; The Venetian Republic and Genoa carried it into Europe by sea. The demographic shock is part of the background to The Renaissance and, through repriced labour, to arguments about the origins of European growth. The Ottoman Empire inherited the plague-scarred Balkans and Anatolia.",
    remember: [
      "1346–53 in Europe; cause confirmed as Yersinia pestis by ancient DNA around 2010–11.",
      "Origin traced to Central Asia (Chüy Valley tombstones, 1338–39); entered Europe via Caffa and Messina, 1346–47.",
      "Mortality roughly 30–50 per cent, an estimate from indirect records, with wide local variation.",
      "Economic effect: labour scarce, wages up, rents down, serfdom weakened in the West despite laws to reverse it.",
      "Quarantine (Ragusa, 1377) and pogroms (Strasbourg, 1349) were responses to the same fear.",
    ],
    yearStart: 1346,
    yearEnd: 1353,
    tags: ["plague", "pandemic", "epidemic", "mortality", "medieval", "labour", "yersinia pestis", "demography"],
    recall: [
      { prompt: "How was the cause of the Black Death finally settled, and when?", answer: "Ancient DNA recovered from plague-pit skeletons identified Yersinia pestis, around 2010–11." },
      { prompt: "What happened to wages and rents after the plague, and what did rulers try to do about it?", answer: "Wages rose and rents fell because labour was scarce; rulers legislated wage caps (for example England's Statute of Labourers, 1351), which largely failed." },
      { prompt: "Where does the word 'quarantine' come from?", answer: "From quaranta giorni, the forty-day isolation of ships adopted in Venetian-ruled ports after Ragusa's thirty-day rule of 1377." },
      { prompt: "Why should mortality figures for the Black Death be quoted as a range?", answer: "They are reconstructed from tax rolls, manorial records and wills, not counts; estimates run from about a third to a half of the population, with towns often higher." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "napoleon-bonaparte",
    kind: "person",
    domain: "history",
    title: "Napoleon Bonaparte",
    subtitle: "The general who made a revolution into a state and a state into an empire",
    summary:
      "Born in Corsica in 1769, Napoleon rose through the Revolutionary armies to rule France from 1799, crowned himself emperor in 1804, reshaped European law and borders, and was defeated at Waterloo in 1815 after an invasion of Russia that destroyed his army.",
    what:
      "Napoleone di Buonaparte was born in Ajaccio in August 1769, a year after France bought Corsica from Genoa. Trained as an artillery officer, he made his name at Toulon in 1793, saved the Directory from a Paris mob in 1795, and in 1796–97 conquered northern Italy with an underfed army by moving faster than anyone thought possible. The Egyptian expedition of 1798 was a strategic failure and a publicity triumph. In November 1799 he took power in the coup of 18 Brumaire, first as one of three consuls, soon as the only one who mattered.\n\nHis domestic work outlasted his conquests: the Civil Code of 1804, the Bank of France, the prefect system, the lycées, the Concordat with the papacy, and the Legion of Honour. He crowned himself emperor in December 1804. Austerlitz in 1805, Jena in 1806 and Friedland in 1807 broke Austria, Prussia and Russia in turn; Trafalgar in 1805 ended any hope of invading Britain, and the Continental System of 1806, a blockade of British trade, drew him into Spain and finally Russia.\n\nThe 1812 campaign began with roughly 600,000 men and ended with perhaps a tenth of them; the figures are contested but the scale is not. Leipzig in 1813, abdication and Elba in 1814, the Hundred Days and Waterloo on 18 June 1815 followed. He died on St Helena in May 1821, of stomach cancer by the most likely account, though arsenic theories persist.",
    why:
      "Napoleon is the reference case for a question that never goes away: how much difference does one person make? Tolstoy said none; his own marshals said everything. The truthful answer separates his operational genius, which was real, from the structural forces he rode, a mobilised nation, a bankrupt old order, and shows that his end came when the structure turned against him in Spain and Russia. He is also a case study in ambition unchecked by any mechanism for stopping.",
    before:
      "The French Revolution had by 1795 executed a king, fought all of Europe, and exhausted itself. Armies raised by mass conscription needed generals who could use them; the Directory needed someone to protect it from both Jacobins and royalists. The old monarchies had not adapted their tactics or their treasuries to a France that could put a million men in the field.",
    after:
      "The Congress of Vienna (1814–15) rebuilt a balance of power that held, more or less, for a century. The Code Napoléon remains the basis of civil law in France, Belgium, the Netherlands, Italy, Spain, Latin America, Louisiana and Quebec. Nationalism, awakened in Germany, Italy and Spain in resistance to him, became the century's motor. Britain emerged with naval and financial supremacy. The template of the plebiscitary strongman, rising from a revolution he then tames, has been imitated ever since.",
    connects:
      "His Egyptian expedition produced The Rosetta Stone; his armies ended The Venetian Republic in 1797 and dismantled the Holy Roman Empire that The Peace of Westphalia had preserved. His attempt to reach India by land is one reason the Suez Canal was a French project a generation later, and his wars ended the last vestiges of The Hanseatic League's independence.",
    remember: [
      "Born Ajaccio 1769; Brumaire coup 1799; emperor 1804; Waterloo 1815; died St Helena 1821.",
      "Lasting work was administrative: Civil Code 1804, Bank of France, prefects, lycées, Concordat.",
      "Trafalgar (1805) ruled out invading Britain; the Continental System led to Spain and Russia.",
      "The 1812 campaign lost the bulk of roughly 600,000 men; exact figures are disputed.",
      "The Congress of Vienna and the Code are his two durable legacies; the empire was not.",
    ],
    yearStart: 1769,
    yearEnd: 1821,
    location: { lat: 48.86, lon: 2.35, country: "France" },
    tags: ["france", "emperor", "revolution", "war", "strategy", "civil code", "waterloo", "leadership"],
    recall: [
      { prompt: "Which of Napoleon's achievements outlasted his empire?", answer: "The Civil Code of 1804, the Bank of France, the prefect system, the lycées and the Legion of Honour; and, indirectly, the balance of power settled at Vienna." },
      { prompt: "What was the Continental System and where did it lead?", answer: "A blockade of British trade from 1806; enforcing it drew Napoleon into Portugal and Spain and then into Russia in 1812." },
      { prompt: "Why is Napoleon a standard test case for the 'great man' question?", answer: "Because his real operational genius has to be weighed against the structural forces he rode (a mobilised nation, an exhausted old order), and because those forces eventually defeated him." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "mongol-empire",
    kind: "institution",
    domain: "history",
    title: "The Mongol Empire",
    subtitle: "The largest contiguous land empire, and the shortest",
    summary:
      "United by Chinggis Khan in 1206, the Mongols conquered from Korea to Hungary within two generations, ruled Eurasia through relay posts and religious tolerance, and split into rival khanates by the 1260s.",
    what:
      "In 1206 a steppe assembly proclaimed Temüjin as Chinggis Khan, ruler of the united Mongol tribes. He reorganised the army into decimal units that cut across clan loyalty, adopted a script, and turned the tribes outward. Northern China fell in stages from 1211; the Khwarazmian empire of Persia and Central Asia was destroyed in 1219–21 with a savagery still remembered. His sons and grandsons finished the work: Kiev in 1240, Hungary and Poland in 1241, Baghdad and the Abbasid caliphate in 1258, Song China by 1279. The empire covered perhaps 24 million square kilometres, the largest contiguous land empire in history.\n\nGovernance was more sophisticated than the reputation suggests. The yam relay system carried messages across the continent with fresh horses at each station; census-takers counted subjects for tax; merchants travelled under paiza passports; Buddhist, Muslim, Christian and Daoist clergy were exempted from taxes. The Yassa, a supposed legal code of Chinggis, is known only from later summaries, and whether it existed as a written law is doubted.\n\nSuccession was the weakness. Each khan's death triggered a kuriltai and a pause in conquest; the Battle of Ain Jalut in 1260, where the Mamluks stopped the Mongol advance into Egypt, came during one such pause. By the 1260s the empire had divided into the Yuan in China, the Ilkhanate in Persia, the Golden Horde in Russia and the Chagatai khanate in Central Asia. The Yuan fell in 1368; the Golden Horde lingered into the fifteenth century.",
    why:
      "The Mongols show that connection and destruction can be the same event. The same peace that let Marco Polo reach Beijing and Persian astronomers work in China let the plague reach Crimea. They also show how a purely military organisation, built around one charismatic lineage, scales brilliantly and then fails on succession: the empire spent as much energy fighting itself after 1260 as it had spent conquering before.",
    before:
      "The twelfth-century steppe was divided among Mongol, Tatar, Kereit and Naiman confederations, some Nestorian Christian, in constant feud. China was split between the Jin in the north and the Song in the south; the Islamic east was a patchwork of Turkish dynasties. No single power controlled the Silk Road, and no one expected one to.",
    after:
      "Timur claimed the Mongol legacy in the 1370s; the Mughals of India, from 1526, took their name from it. Russia's princes learned tax collection and autocracy under the Golden Horde, a debt the Russians have argued about since. Persian miniature painting, Chinese blue-and-white porcelain and the spread of gunpowder westward all owe something to the exchange the Mongols forced. Population losses in Persia and northern China were catastrophic and took centuries to recover.",
    connects:
      "The Pax Mongolica was the Silk Road's high season and the road The Black Death took west. The Ming Dynasty was founded by expelling the Yuan; The Ottoman Empire's rise was possible partly because Timur, a Mongol heir, broke and then left Anatolia. The yam relay is the ancestor of every state postal and intelligence network.",
    remember: [
      "1206: Temüjin proclaimed Chinggis Khan; decimal army units broke clan loyalties.",
      "Conquests: north China 1211 onward, Khwarazm 1219–21, Kiev 1240, Hungary 1241, Baghdad 1258, Song China 1279.",
      "Tools of rule: the yam relay, censuses, merchant passports, tax exemption for all clergy.",
      "Division after 1260 into Yuan, Ilkhanate, Golden Horde and Chagatai khanate; succession was the fatal weakness.",
      "The Yassa as a written code is doubtful; it survives only in later descriptions.",
    ],
    yearStart: 1206,
    yearEnd: 1368,
    location: { lat: 47.2, lon: 102.85, country: "Mongolia" },
    tags: ["mongols", "genghis khan", "chinggis", "steppe", "conquest", "eurasia", "khanate", "empire"],
    recall: [
      { prompt: "What structural reform underpinned Mongol military success?", answer: "Reorganising the army into decimal units (tens, hundreds, thousands, ten thousands) that mixed clans and answered to appointed commanders." },
      { prompt: "Why did Mongol expansion repeatedly pause?", answer: "Each khan's death required a kuriltai to choose a successor, pulling commanders and armies back toward Mongolia; Ain Jalut (1260) fell in such a pause." },
      { prompt: "What was the yam?", answer: "A relay network of post stations with fresh horses that carried messages and officials across the empire." },
      { prompt: "Into which four states did the empire divide after 1260?", answer: "The Yuan (China), the Ilkhanate (Persia), the Golden Horde (Russia and the western steppe) and the Chagatai khanate (Central Asia)." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "hanseatic-league",
    kind: "institution",
    domain: "history",
    title: "The Hanseatic League",
    subtitle: "A trading network that behaved like a state without being one",
    summary:
      "An association of north German merchant towns, led by Lübeck, that dominated Baltic and North Sea trade from the thirteenth to the fifteenth century, waged war against Denmark, and dissolved slowly after its last assembly in 1669.",
    what:
      "The Hansa had no founding charter, no capital, no army of its own and no treasury, which makes it hard to define and easy to underestimate. It grew out of associations of German merchants trading abroad in the twelfth century; Lübeck, founded on its present site in 1159, became the hinge between the Baltic and the overland road to Hamburg and the North Sea. By the mid-fourteenth century the merchant leagues had become a league of towns, around seventy full members and more than a hundred associates at its peak, meeting irregularly in a diet, the Hansetag, first convened in 1356.\n\nIts power rested on four foreign trading posts, the Kontore: Bergen (the Bryggen), London (the Steelyard), Bruges and Novgorod (the Peterhof). Hansards there lived under their own law, enjoyed tax privileges extracted from local rulers, and controlled the flow of Norwegian stockfish, Russian furs and wax, Swedish copper, Prussian grain and timber, Flemish cloth and Lüneburg salt, the last essential for the herring trade that fed Catholic Europe on fast days. The cog, a broad-beamed sailing ship, was its workhorse.\n\nWhen Denmark's Valdemar IV threatened the herring markets, the towns fought and won: the Treaty of Stralsund in 1370 gave the Hansa fortresses in Scania and a veto over the Danish succession. Decline came with stronger territorial states, Dutch competition, the shift of herring shoals and the Atlantic trade. Elizabeth I closed the Steelyard in 1598; the last Hansetag met in 1669 with nine towns.",
    why:
      "The Hansa is the best pre-modern example of coordination without sovereignty. Its members were competitors that cooperated on the one thing that mattered, keeping foreign rulers from taxing them, and enforced discipline by the threat of exclusion, the Verhansung, which cut a town off from every market at once. It shows both the reach and the ceiling of that model: brilliant against weak states, helpless once states became strong.",
    before:
      "Baltic trade before the Germans was Scandinavian and Slavic: Vikings, Gotlanders, the Wendish towns. The eastward colonisation of the twelfth century brought German merchants and planted towns along the coast; Lübeck's law was copied by dozens of them, creating a shared legal culture before there was a league.",
    after:
      "Lübeck, Hamburg and Bremen still call themselves Hanseatic cities, and German number plates carry the H. The Bryggen wharf in Bergen and the brick Gothic of the Baltic ports are its architecture. The Dutch took over the carrying trade in the sixteenth century and built on it the first modern commercial economy. The European Union has been compared to the Hansa, usually by people who want it to be weaker.",
    connects:
      "The Dutch East India Company and the Amsterdam market rose on trade routes the Hansa had built and lost. The Venetian Republic is the southern counterpart: a maritime power that was a state, where the Hansa was a network. The Reformation spread quickly through Hanseatic towns, and The Black Death arrived in the Baltic on Hanseatic ships in 1349–50.",
    remember: [
      "No charter, capital, treasury or standing army; a league of towns led by Lübeck, first diet 1356, last 1669.",
      "Four Kontore: Bergen, London (Steelyard), Bruges, Novgorod.",
      "Key goods: stockfish, furs, wax, grain, timber, cloth, and Lüneburg salt for herring.",
      "Treaty of Stralsund (1370): the towns beat Denmark and won fortresses and a veto over its succession.",
      "Discipline by exclusion (Verhansung); undone by strong territorial states and Dutch competition.",
    ],
    yearStart: 1159,
    yearEnd: 1669,
    location: { lat: 53.87, lon: 10.69, country: "Germany" },
    tags: ["hansa", "lübeck", "baltic", "trade", "merchants", "north sea", "network", "medieval commerce"],
    recall: [
      { prompt: "What did the Hansa lack that makes it hard to call a state?", answer: "A founding charter, a capital, a treasury, a standing army and a permanent government; it was a league of towns meeting in an irregular diet." },
      { prompt: "Name the four Kontore.", answer: "Bergen, London (the Steelyard), Bruges and Novgorod (the Peterhof)." },
      { prompt: "How did the Hansa enforce discipline on its own members?", answer: "By exclusion, the Verhansung, which cut a town off from all Hanseatic markets at once." },
      { prompt: "Why did the Hansa decline?", answer: "Territorial states grew strong enough to refuse privileges, the Dutch undercut its carrying trade, herring shoals shifted, and Atlantic trade moved the centre of gravity west." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "ming-dynasty",
    kind: "institution",
    domain: "history",
    title: "The Ming Dynasty",
    subtitle: "Restoration, the Forbidden City, treasure fleets, and a turn inward",
    summary:
      "Founded in 1368 by a peasant rebel who expelled the Mongols, the Ming ruled China until 1644, built Beijing and the Great Wall as we know them, sent fleets to Africa, and then restricted maritime trade while silver from Japan and the Americas transformed its economy.",
    what:
      "Zhu Yuanzhang, an orphaned peasant turned monk turned rebel, took Nanjing in 1356 and drove the Mongol Yuan from Beijing in 1368, reigning as the Hongwu emperor. He rebuilt a Confucian bureaucracy recruited by examination, abolished the office of chief minister after a purge in 1380, and governed with a suspicion that killed tens of thousands. His son the Yongle emperor seized the throne in 1402, moved the capital to Beijing, built the Forbidden City (completed 1420), and sent the eunuch admiral Zheng He on seven voyages between 1405 and 1433 with fleets of hundreds of ships to Southeast Asia, India, the Gulf and East Africa.\n\nThe voyages stopped after 1433. The reasons are debated: cost, court politics between Confucian officials and eunuchs, a Mongol threat that pulled money north. The ban on private overseas trade, the haijin, first imposed by Hongwu, was enforced with varying rigour and relaxed in 1567. It did not stop trade; it made trade smuggling, and the 'Japanese pirates' of the sixteenth century were mostly Chinese.\n\nThe Ming economy ran on silver. Taxes were consolidated into silver payments under the Single Whip reforms of the 1570s, and the silver came from Japan and, via Manila, from Spanish Peru and Mexico; by some estimates a third or more of American silver ended up in China. Population perhaps doubled to around 150 million. Fiscal weakness, climate shocks of the seventeenth century, and peasant rebellion opened the door: Li Zicheng took Beijing in April 1644, the last emperor hanged himself, and the Manchus entered through the Wall to found the Qing.",
    why:
      "The Ming raise the question historians call the Great Divergence: China had the fleets, the printing, the porcelain, the bureaucracy and the largest economy on earth, and it was Europe that went on to industrialise. The treasure fleets are the standard example of a capability abandoned by choice, and the silver economy is the standard example of globalisation before the word: a Chinese tax reform shaped mining decisions in the Andes.",
    before:
      "The Yuan, the Mongol dynasty founded by Kublai Khan in 1271, had ruled China with a foreign elite, paper money that collapsed into inflation, and, by the 1340s, floods, famine and plague. Rebel movements steeped in Buddhist millenarianism, the Red Turbans, gave Zhu Yuanzhang his start.",
    after:
      "The Qing kept Ming institutions almost intact and pushed the frontier into Tibet, Xinjiang and Mongolia. Ming loyalists held Taiwan until 1683. The Great Wall, the Forbidden City, blue-and-white porcelain and the novel (Journey to the West, Water Margin) are the dynasty's visible inheritance. The story of Zheng He was revived in the twentieth century as a symbol of peaceful Chinese maritime power, which is a use of history rather than a description of it.",
    connects:
      "The Ming were founded by expelling the Mongol Empire and are the eastern terminus of the Silk Road's last overland phase. Their silver demand is a chapter in the histories of Fiat Money and The Gold Standard. The Dutch East India Company fought and traded with the late Ming for porcelain and silk, and the Forbidden City stands to Beijing as the Topkapi stands to Istanbul.",
    remember: [
      "1368–1644; founded by Zhu Yuanzhang (Hongwu), who expelled the Mongol Yuan.",
      "Yongle moved the capital to Beijing, built the Forbidden City (1420) and sent Zheng He's seven voyages (1405–33).",
      "The voyages ended by choice; the haijin ban turned trade into smuggling, then was relaxed in 1567.",
      "A silver economy: Single Whip tax reform (1570s), silver from Japan and Spanish America.",
      "Fell to Li Zicheng's rebellion in April 1644; the Manchu Qing took the throne.",
    ],
    yearStart: 1368,
    yearEnd: 1644,
    location: { lat: 39.9, lon: 116.4, country: "China" },
    tags: ["china", "beijing", "zheng he", "forbidden city", "silver", "porcelain", "dynasty", "maritime"],
    recall: [
      { prompt: "Why did the Ming treasure voyages stop after 1433?", answer: "The causes are debated: enormous cost, factional conflict between Confucian officials and court eunuchs, and a renewed Mongol threat that redirected resources north." },
      { prompt: "What was the Single Whip reform, and what did it depend on?", answer: "Consolidating taxes and labour dues into a single silver payment in the 1570s; it depended on silver imported from Japan and Spanish America via Manila." },
      { prompt: "What did the haijin maritime ban actually achieve?", answer: "It did not stop overseas trade; it pushed trade into smuggling and armed 'piracy', much of it Chinese, until the ban was relaxed in 1567." },
      { prompt: "How did the Ming end?", answer: "Li Zicheng's rebel army took Beijing in April 1644; the Chongzhen emperor hanged himself; the Manchus entered and founded the Qing." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "peace-of-westphalia",
    kind: "event",
    domain: "history",
    title: "The Peace of Westphalia",
    subtitle: "The treaties of 1648 and the myth built on them",
    summary:
      "Two treaties signed at Münster and Osnabrück in October 1648 ended the Thirty Years' War, recognised Dutch and Swiss independence, and settled the religious constitution of the Holy Roman Empire; the 'Westphalian sovereignty' later attributed to them is largely a modern invention.",
    what:
      "The Thirty Years' War began in 1618 with a defenestration in Prague and ended as a general European war fought mostly on German soil, with Sweden, France, Spain, Denmark and the Dutch involved and the German population reduced by perhaps a third in the worst regions; the figure is contested and varied enormously by place. Negotiations opened in 1643 in two Westphalian towns, Catholic delegates at Münster and Protestant delegates at Osnabrück, because the parties would not sit in one room, and lasted five years while the war continued.\n\nThe treaties of 24 October 1648 did four main things. They confirmed the Peace of Augsburg and extended its protection to Calvinists, with 1624 as the reference year for which confession held which church. They gave the roughly three hundred estates of the Holy Roman Empire the right to make alliances and conduct foreign policy so long as these were not aimed at the emperor. They transferred territory: Alsace rights to France, Western Pomerania and Bremen-Verden to Sweden. And they recognised the Dutch Republic's independence from Spain and, in effect, that of the Swiss Confederation.\n\nWhat the treaties did not do was proclaim a principle of sovereign equality among states or forbid interference in internal affairs. The idea that 1648 founded the modern 'Westphalian system' of sovereign states was assembled by nineteenth-century German jurists and twentieth-century international-relations theorists; Andreas Osiander's 2001 article is the standard demolition. The treaties preserved the Empire, with its emperor, diet and courts, rather than abolishing it.",
    why:
      "Westphalia is a lesson in how a settlement becomes a slogan. The documents are a detailed, exhausted compromise on religion and territory; the 'Westphalian state' is an abstraction later readers needed and found. Knowing the difference is useful every time someone invokes 'the Westphalian order' in a debate about intervention, since the thing they are defending or attacking is a twentieth-century idea wearing a seventeenth-century date.",
    before:
      "The Peace of Augsburg of 1555 had let princes choose between Lutheranism and Catholicism but ignored Calvinists and left disputes about church lands unresolved. The Habsburg emperors sought to recatholicise their lands; Protestant estates formed a Union, Catholics a League. The war's phases, Bohemian, Danish, Swedish and French, each drew in a new outside power, and Spain's separate war with the Dutch had run since 1568.",
    after:
      "Germany stayed a patchwork of some three hundred polities under a weak emperor until Napoleon dissolved the Empire in 1806. France emerged as the dominant continental power; Sweden briefly as a Baltic one. The principle that a ruler's religion need not be his subjects' religion spread slowly. The congress method, plenipotentiaries negotiating over years with agreed protocols and precedence, became the model for Utrecht, Vienna and Versailles.",
    connects:
      "The treaties closed the wars that The Reformation opened. They recognised the Dutch Republic whose Dutch East India Company was already trading in Asia, and they preserved the Empire that Napoleon Bonaparte would abolish. The modern law of Diplomatic Immunity and the practice of permanent embassies grew from the congress diplomacy Westphalia established.",
    remember: [
      "Signed 24 October 1648 at Münster and Osnabrück; ended the Thirty Years' War (1618–48).",
      "Extended Augsburg's toleration to Calvinists; 1624 as the reference year for confessional holdings.",
      "Recognised Dutch and (effectively) Swiss independence; gave French and Swedish territorial gains.",
      "Preserved the Holy Roman Empire and gave its estates limited treaty-making rights.",
      "'Westphalian sovereignty' is a nineteenth- and twentieth-century construct, not a provision of the treaties (Osiander, 2001).",
    ],
    yearStart: 1648,
    yearEnd: 1648,
    location: { lat: 51.96, lon: 7.63, country: "Germany" },
    tags: ["treaty", "thirty years war", "sovereignty", "holy roman empire", "diplomacy", "münster", "osnabrück", "international relations"],
    recall: [
      { prompt: "Why were there two treaties in two towns?", answer: "Catholic delegations negotiated at Münster and Protestant delegations at Osnabrück because the parties would not meet in one place; both treaties were signed on 24 October 1648." },
      { prompt: "What is the main criticism of the idea of 'Westphalian sovereignty'?", answer: "The treaties contain no principle of sovereign equality or non-interference; the concept was built by later jurists and IR theorists (see Osiander, 2001), and the treaties actually preserved the Holy Roman Empire." },
      { prompt: "Which two states gained recognition of their independence at Westphalia?", answer: "The Dutch Republic (from Spain) and, in effect, the Swiss Confederation." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "istanbul",
    kind: "place",
    domain: "geography",
    title: "Istanbul",
    subtitle: "One city, three names, two continents, sixteen centuries as a capital",
    summary:
      "Founded as Byzantium around 657 BCE, refounded as Constantinople in 330 CE, taken by the Ottomans in 1453 and officially renamed Istanbul in 1930, the city on the Bosporus has been the capital of two empires and remains the largest in Europe.",
    what:
      "The site explains the city. A peninsula of seven hills sits between the Sea of Marmara and a deep, sheltered inlet, the Golden Horn, at the southern mouth of the Bosporus; whoever holds it controls the passage between the Black Sea and the Mediterranean and the crossing between Europe and Asia. Greek colonists from Megara founded Byzantium there around 657 BCE, a date from tradition. Constantine chose it as his new Rome in 324 and dedicated it in 330; the Theodosian Walls of the fifth century made it the best-defended city in the world, and Justinian's Hagia Sophia, completed in 537, was its largest church for nearly a thousand years.\n\nThe city held off Persians, Arabs, Bulgars and Rus. It fell only twice: to the Fourth Crusade in 1204, which broke it, and to Mehmed II on 29 May 1453, who made it the capital of the Ottoman Empire, repopulated it with Turks, Greeks, Armenians and Jews, and built the Topkapi palace on the old acropolis. Sinan's mosques of the sixteenth century gave it the skyline it still has. 'Istanbul', probably from the Greek eis tin polin, 'to the city', was in common use for centuries before the Republic made it official in 1930.\n\nThe republic moved the capital to Ankara in 1923. The city has grown from roughly a million people in 1950 to more than fifteen million, most of them in districts that did not exist then, straddling both continents and joined by three bridges and two tunnels.",
    why:
      "Istanbul is the standing demonstration that geography sets the terms and politics chooses among them. It is the world's great example of a chokepoint city, and its history is a sequence of powers deciding what a chokepoint is for: a fortress, a customs house, a capital, a symbol. Reading a map of it is a good exercise in reading any city: find the water, find the walls, find where the old money sits.",
    before:
      "Before Constantine, Byzantium was a prosperous but secondary Greek city, fought over by Athens and Sparta, sacked by Septimius Severus in 196 CE and rebuilt. Rome ruled the Mediterranean from Rome; the eastern frontier and the Danube were where the army was, which is why an eastern capital made sense.",
    after:
      "The city lost its Greek population almost entirely in the twentieth century, through the 1923 exchange, the 1955 pogrom and emigration; it remains the seat of the Ecumenical Patriarch. It is Turkey's economic centre, a hub airport, and a stage for the country's politics: the 2013 Gezi protests, the 2016 coup attempt on the Bosphorus Bridge. A planned canal parallel to the Bosporus is the latest attempt to rewrite the geography.",
    connects:
      "The Bosporus is the reason the city exists. It was the capital of The Ottoman Empire for 470 years, the prize of The Venetian Republic's crusade in 1204, and the western end of the Silk Road for much of its life. Coffeehouses were an Istanbul institution before they were a London one, and the Hagia Sophia is a reference point for every dome in The Renaissance.",
    remember: [
      "Byzantium c. 657 BCE (traditional); Constantinople dedicated 330 CE; Ottoman capital from 1453; official name Istanbul from 1930.",
      "The site: a peninsula between the Marmara, the Golden Horn and the Bosporus, controlling sea and land passages.",
      "Fell only twice: 1204 (Fourth Crusade) and 1453 (Mehmed II).",
      "Hagia Sophia 537; Theodosian Walls fifth century; Sinan's mosques sixteenth century.",
      "Capital moved to Ankara in 1923; population from about a million in 1950 to over fifteen million today.",
    ],
    yearStart: -657,
    location: { lat: 41.01, lon: 28.98, country: "Türkiye" },
    tags: ["turkey", "constantinople", "byzantium", "bosphorus", "city", "capital", "chokepoint", "hagia sophia"],
    recall: [
      { prompt: "What three bodies of water define Istanbul's site?", answer: "The Sea of Marmara, the Golden Horn and the Bosporus." },
      { prompt: "How many times was Constantinople captured, and when?", answer: "Twice: by the Fourth Crusade in 1204 and by Mehmed II on 29 May 1453." },
      { prompt: "Where does the name 'Istanbul' probably come from, and when did it become official?", answer: "Probably from Greek eis tin polin, 'to the city'; official in 1930." },
      { prompt: "When did Istanbul stop being a capital, and what replaced it?", answer: "In 1923, when the Turkish Republic made Ankara the capital." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "bosporus",
    kind: "place",
    domain: "geography",
    title: "The Bosporus",
    subtitle: "Thirty-one kilometres of water that decide who reaches the Black Sea",
    summary:
      "The strait between Europe and Asia connecting the Black Sea to the Sea of Marmara, and through the Dardanelles to the Mediterranean; narrow, fast-flowing, governed since 1936 by the Montreux Convention, and a constant in the strategy of every power around it.",
    what:
      "The Bosporus runs about 31 kilometres from the Black Sea to the Marmara, between 700 metres and 3.5 kilometres wide, with sharp bends that make it one of the most difficult commercial waterways in the world. It is a drowned river valley. Its water moves in two layers: fresher Black Sea water flows south on the surface, and denser Mediterranean water flows north along the bottom, a fact Luigi Marsigli measured with weighted lines in 1681. Whether the strait opened catastrophically around 7,600 years ago, flooding a freshwater lake and seeding flood myths, as Ryan and Pitman proposed in 1997, is contested; most geologists now favour a slower, less dramatic connection.\n\nWith the Dardanelles it forms the Turkish Straits, the only sea route between the Black Sea and the world. Russia's warm-water ambitions, Britain's fear of them, the Crimean War, Gallipoli in 1915 and the Cold War all turn on this passage. The Montreux Convention of 1936 gives Turkey control: merchant ships pass freely in peacetime, warships of non-Black Sea states face tonnage and duration limits, and Turkey may close the straits to belligerents in war, which it invoked in February 2022.\n\nThree suspension bridges (1973, 1988, 2016) and the Marmaray rail tunnel (2013) and Eurasia road tunnel (2016) cross it. About forty thousand vessels a year pass, many carrying oil, which is why Turkey has proposed a parallel canal to the west.",
    why:
      "The Bosporus is the clearest case of a physical fact producing a permanent political problem. Nothing about its geology has changed since antiquity, yet every generation renegotiates who may pass and on what terms. It is the model for thinking about any chokepoint, from Hormuz to Malacca to an undersea cable landing: the question is never the strait itself but the rules, and who can enforce them.",
    before:
      "Greek myth put Io's crossing here (bous poros, 'cow's ford') and the Symplegades, the clashing rocks of the Argonauts, at its Black Sea mouth. Darius bridged it with boats in about 513 BCE to invade Scythia. The Byzantines chained the Golden Horn rather than the strait; Mehmed II built Rumeli Hisarı on the European shore in 1452 to cut Constantinople off from the Black Sea before his siege.",
    after:
      "The strait has become an urban waterway, lined with Ottoman waterside mansions, ferries and villages absorbed into Istanbul, while remaining a shipping lane where tanker accidents have burned in the city's centre. The 2022 war in Ukraine made Montreux the most consulted treaty in the Black Sea, and the grain corridor negotiations of that year ran through Turkish control of the passage.",
    connects:
      "Istanbul is the city the strait created; The Ottoman Empire and Byzantium before it were, in a sense, governments of the passage. The Suez Canal is the other made-or-found chokepoint of the eastern Mediterranean, and the two together define the sea lanes of the region. The Silk Road's Black Sea branch ended at ports whose only outlet was this water.",
    remember: [
      "About 31 km long, 700 m at its narrowest; a drowned river valley with a two-layer current.",
      "With the Dardanelles, the only sea route between the Black Sea and the Mediterranean.",
      "Montreux Convention (1936): Turkish control, free merchant passage, limits on foreign warships, closure to belligerents in war.",
      "Bridges 1973, 1988, 2016; Marmaray rail tunnel 2013.",
      "The 'Black Sea deluge' hypothesis (1997) is contested; most geologists favour a gradual connection.",
    ],
    yearStart: -513,
    location: { lat: 41.12, lon: 29.06, country: "Türkiye" },
    tags: ["strait", "bosphorus", "black sea", "chokepoint", "montreux", "turkey", "shipping", "geopolitics"],
    recall: [
      { prompt: "Describe the Bosporus current.", answer: "Two layers: fresher Black Sea water flows south on the surface while denser Mediterranean water flows north along the bottom; measured by Marsigli in 1681." },
      { prompt: "What does the Montreux Convention allow Turkey to do?", answer: "Control passage: merchant ships pass freely in peacetime, foreign warships face tonnage and duration limits, and Turkey may close the straits to belligerent warships in wartime." },
      { prompt: "Why did Mehmed II build Rumeli Hisarı in 1452?", answer: "To control the strait and cut Constantinople off from Black Sea supply before the 1453 siege." },
    ],
    readingMinutes: 5,
    origin: "seeded",
  },
  {
    id: "suez-canal",
    kind: "place",
    domain: "geography",
    title: "The Suez Canal",
    subtitle: "A ditch through the desert that moved the centre of the world's trade",
    summary:
      "Opened in November 1869 after ten years of construction under Ferdinand de Lesseps, the sea-level canal linking the Mediterranean and the Red Sea cut the London-Bombay voyage by roughly 40 per cent and has been fought over, closed and blocked ever since.",
    what:
      "The idea is ancient: a canal from the Nile to the Red Sea existed under Pharaoh Necho II and Darius I, was reopened by the Ptolemies and the Romans, and silted up by the eighth century. A direct sea-level cut from the Mediterranean waited for accurate surveying; Napoleon's engineers in 1798 wrongly concluded the Red Sea was ten metres higher and would flood the delta. The French diplomat Ferdinand de Lesseps won a concession from the Egyptian viceroy Said Pasha in 1854, formed the Compagnie universelle in 1858, and began digging in 1859. Early work used forced Egyptian labour, corvée, by the tens of thousands; the death toll is unknown and estimates range widely. Steam dredgers finished the job. The canal opened on 17 November 1869, 164 kilometres long; it has since been widened, deepened and lengthened to 193 kilometres.\n\nBritain, which had opposed the canal, became its main user. In 1875 Disraeli bought the Egyptian government's shares with a Rothschild loan; in 1882 Britain occupied Egypt. The Constantinople Convention of 1888 declared the canal open to all ships in war and peace, a rule honoured selectively. In July 1956 Nasser nationalised the company; the Anglo-French-Israeli invasion that followed collapsed under American and Soviet pressure and marked the end of Britain as a global power. The canal was closed in 1956–57 and again from 1967 to 1975, when fifteen ships sat trapped in the Great Bitter Lake for eight years.\n\nAbout 12 per cent of world trade passes through it. A second lane opened in 2015; the container ship Ever Given blocked it for six days in March 2021.",
    why:
      "Suez is the reference case for infrastructure as geopolitics. A canal is neutral in principle and never in practice: the power that most needs it will find a way to own or garrison it, and the power that owns it can be broken by it, as Britain was in 1956. It is also a case in cost accounting: the canal made sense because it charged a toll on the difference between two routes, which means its value is set by the alternatives, from the Cape to the Arctic to a railway.",
    before:
      "European trade with Asia went round the Cape of Good Hope, a voyage of months, or overland across Egypt by camel and, from the 1850s, by rail. The British East India Company's mails already crossed Egypt; steamships were making the Red Sea route practical. What was missing was a way to move a ship, not a passenger.",
    after:
      "Steamships displaced sail on the Asia route, since sailing ships could not use the canal's winds; coaling stations at Aden, Perim and Port Said became strategic. The Mediterranean revived as a trade sea after three centuries. Egypt's debt from the canal and Ismail's ambitions led to foreign financial control and occupation. Today the canal supplies Egypt with several billion dollars a year, and Houthi attacks in the Red Sea from late 2023 diverted much traffic back round the Cape, a reminder that the alternative never went away.",
    connects:
      "The canal completed the shift from the Silk Road caravans to sea, and gave The Bosporus a rival as the region's chokepoint. Napoleon Bonaparte's expedition mis-surveyed it; The Ottoman Empire nominally owned Egypt when it was dug. Containerization and the Ever Given show what the canal's dimensions now constrain, and Dubai's rise as a port is partly a bet on the same sea lane.",
    remember: [
      "Opened 17 November 1869; de Lesseps, Compagnie universelle, concession 1854; forced labour in the early years.",
      "Britain bought Egypt's shares in 1875 and occupied Egypt in 1882; Constantinople Convention 1888 promised free passage.",
      "Nasser nationalised it in July 1956; the Suez Crisis ended British pretensions to global power.",
      "Closed 1956–57 and 1967–75; blocked by the Ever Given for six days in 2021.",
      "Carries roughly 12 per cent of world trade; its value is always set by the cost of the alternative route.",
    ],
    yearStart: 1859,
    yearEnd: 1869,
    location: { lat: 30.59, lon: 32.27, country: "Egypt" },
    tags: ["egypt", "canal", "shipping", "red sea", "chokepoint", "de lesseps", "nasser", "trade route"],
    recall: [
      { prompt: "Why did Napoleon's engineers not attempt a sea-level canal in 1798?", answer: "Their survey wrongly found the Red Sea about ten metres higher than the Mediterranean and feared flooding the delta." },
      { prompt: "How did Britain, which opposed the canal, come to control it?", answer: "Disraeli bought Egypt's shares in 1875 with a Rothschild loan, and Britain occupied Egypt in 1882." },
      { prompt: "What did the 1956 Suez Crisis demonstrate?", answer: "That Britain and France could no longer act as global powers against American and Soviet opposition; Nasser's nationalisation stood." },
      { prompt: "What determines the economic value of the canal?", answer: "The cost of the alternative route, chiefly the voyage round the Cape of Good Hope." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "dubai",
    kind: "place",
    domain: "geography",
    title: "Dubai",
    subtitle: "From pearling creek to global hub in two generations",
    summary:
      "A small Gulf port ruled by the Al Maktoum family since 1833, Dubai found modest oil in 1966 and spent it on ports, an airline and free zones, becoming a trading, aviation and financial hub whose economy now depends only marginally on hydrocarbons.",
    what:
      "Dubai began as a fishing and pearling village on a creek, a tidal inlet that gave small boats shelter. A branch of the Bani Yas tribe under the Al Maktoum took control in 1833; exclusive agreements with Britain in 1892 made it one of the Trucial States, in which Britain ran foreign affairs and little else. In 1901 Sheikh Maktoum bin Hasher abolished customs duties, and Persian merchants from Lingah moved across the Gulf, bringing trade and the wind-tower houses of Bastakiya. The pearl trade, the mainstay, collapsed in the 1930s under Japanese cultured pearls and the Depression.\n\nOil was found offshore in the Fateh field in 1966 and first exported in 1969; the reserves were always small beside Abu Dhabi's. Sheikh Rashid bin Saeed, ruler from 1958 to 1990, had already dredged the Creek in the 1950s and borrowed to build Port Rashid in 1972 and Jebel Ali, then the world's largest man-made harbour, in 1979. The Jebel Ali Free Zone (1985) let foreign firms own their businesses outright; Emirates airline (1985) started with two leased aircraft. The United Arab Emirates formed in 1971 with Dubai as its commercial capital.\n\nThe 2000s brought the real-estate boom, the Palm islands, the Burj Khalifa (2010, 828 metres), and in 2008–09 a debt crisis that Abu Dhabi resolved with a bailout of about ten billion dollars. Oil is now a low single-digit share of Dubai's GDP; trade, logistics, tourism, finance and property are the economy. The workforce is roughly 90 per cent foreign, on temporary visas.",
    why:
      "Dubai is the modern proof that geography plus rules can substitute for resources. Its location between Europe and Asia mattered, but so did Singapore's and Aden's; what distinguished Dubai was a ruling family that treated the state as a trading company, borrowed before it could pay, and built the port before the demand. It is also a case for the harder questions: what a hub owes to the migrant labour that builds it, and how long a model built on transit lasts when the neighbours copy it.",
    before:
      "The Gulf coast in the nineteenth century lived on pearls, dates, fishing and dhow trade with India and East Africa, under British naval supervision. Sharjah, not Dubai, was the more important town; Britain's regional airbase was there until the 1960s. The idea that this coast would host the world's busiest international airport would have seemed absurd in 1950.",
    after:
      "Dubai's model, free zones, a flag-carrier airline, a fast port, has been copied across the Gulf, from Doha to Riyadh, which is now its most serious competitor. Its airport has been the busiest for international passengers since 2014. It has become a refuge and a laundry for capital from Russia, India, Iran and Africa, and a stage for the geopolitics of a region in which it tries to trade with everyone.",
    connects:
      "Dubai is a modern Venetian Republic in one respect, a merchant state that lives on carrying others' goods, and a modern Hanseatic League Kontor in another. Its port is a product of Containerization, and its sea trade runs through the Suez Canal and the Strait of Hormuz. Its currency is pegged to the dollar under the rules that Bretton Woods began and its collapse rewrote.",
    remember: [
      "Al Maktoum rule since 1833; Trucial agreement with Britain 1892; free port from 1901; pearling collapse in the 1930s.",
      "Oil found 1966, exported 1969, always small; Sheikh Rashid spent it on the Creek, Port Rashid (1972) and Jebel Ali (1979).",
      "Jebel Ali Free Zone and Emirates airline both 1985; UAE founded 1971.",
      "Debt crisis 2008–09 resolved by an Abu Dhabi bailout; Burj Khalifa 2010.",
      "Oil is now a low single-digit share of GDP; the workforce is about 90 per cent foreign.",
    ],
    yearStart: 1833,
    location: { lat: 25.2, lon: 55.27, country: "United Arab Emirates" },
    tags: ["uae", "gulf", "port", "free zone", "trade hub", "aviation", "jebel ali", "emirates"],
    recall: [
      { prompt: "What did Dubai do in 1901 that shaped its future?", answer: "Abolished customs duties, making it a free port and attracting Persian merchants from Lingah." },
      { prompt: "Why is oil not the explanation for Dubai's wealth?", answer: "Reserves were always small; the rulers invested the revenue in ports, a free zone and an airline, and hydrocarbons are now a low single-digit share of GDP." },
      { prompt: "What were the two key institutions founded in 1985?", answer: "The Jebel Ali Free Zone and Emirates airline." },
      { prompt: "What ended Dubai's 2008–09 crisis?", answer: "A bailout of roughly ten billion dollars from Abu Dhabi." },
    ],
    readingMinutes: 6,
    origin: "seeded",
  },
  {
    id: "bretton-woods",
    kind: "event",
    domain: "economics",
    title: "Bretton Woods",
    subtitle: "The 1944 conference that pegged the world to the dollar, and the 1971 morning that unpegged it",
    summary:
      "In July 1944 delegates from forty-four nations met in a New Hampshire hotel to design the post-war monetary order: fixed exchange rates anchored to a dollar convertible into gold, policed by a new International Monetary Fund and a World Bank; the system ran until Nixon suspended convertibility in August 1971.",
    what:
      "The United Nations Monetary and Financial Conference met at the Mount Washington Hotel in Bretton Woods, New Hampshire, from 1 to 22 July 1944, while the war was still being fought. Its two designers had spent years arguing. John Maynard Keynes for Britain proposed an international clearing union with its own unit, the bancor, and penalties on creditor countries that hoarded surpluses. Harry Dexter White for the United States Treasury proposed a fund of national currencies with the dollar at the centre. The Americans had the gold and the goods; White's plan prevailed.\n\nThe system worked like this. The dollar was fixed to gold at 35 dollars an ounce and convertible for foreign central banks. Every other currency was pegged to the dollar within a one per cent band, adjustable only for 'fundamental disequilibrium' with the Fund's consent. The IMF lent to countries in short-term balance-of-payments trouble; the International Bank for Reconstruction and Development, later the World Bank, lent for rebuilding. Capital controls were permitted and expected, so that governments could run full employment at home without currency flight.\n\nThe flaw was pointed out by Robert Triffin in 1960: the world needed dollars for reserves, which required America to run deficits, which eroded confidence that the dollars could be redeemed in gold. By 1971 foreign dollar holdings far exceeded US gold. On 15 August Nixon closed the gold window; the Smithsonian realignment of December 1971 tried to save the pegs, and by March 1973 the major currencies floated.",
    why:
      "Bretton Woods is the case that shows a monetary system is a political settlement wearing an accounting mask. The technical design, pegs and bands and quotas, expressed a bargain: America's dollar would be the world's money in exchange for America's markets and security. When the bargain no longer suited the hegemon, the system ended by presidential announcement on a Sunday evening. Everything since, floating rates, the euro, dollar dominance without gold, is life after that decision.",
    before:
      "The gold standard had broken in 1914, been restored badly in the 1920s and abandoned again in the 1930s, when competitive devaluations and tariffs deepened the Depression. The lesson drawn by 1944 was that unmanaged currencies produced beggar-thy-neighbour chaos and, in the view of the planners, war. The wartime Atlantic Charter and Lend-Lease had already committed Britain to an open trading system on American terms.",
    after:
      "The IMF and World Bank outlived the exchange-rate system they were built to serve and became the lenders and disciplinarians of the developing world. Floating rates made currency markets the largest in the world and inflation, not balance of payments, the central bank's enemy. The dollar remained the reserve currency without gold behind it, a fact economists still find hard to explain fully. Calls for a 'new Bretton Woods' surface at every crisis, in 2008 and after, usually meaning a wish for a bargain nobody is in a position to strike.",
    connects:
      "Bretton Woods is the bridge between The Gold Standard and Fiat Money; the IMF it created is the international face of Central Banks, and its collapse made Inflation the defining problem of the 1970s. The negotiation between Keynes and White is a textbook case for Game Theory: a bargain between a creditor with all the cards and a debtor with the better argument. Dubai's dollar peg is a small descendant of the design.",
    remember: [
      "1–22 July 1944, Mount Washington Hotel, forty-four nations; Keynes (bancor, clearing union) lost to White (dollar-centred fund).",
      "Dollar fixed at 35 dollars an ounce of gold; other currencies pegged to the dollar within one per cent bands.",
      "Created the IMF (short-term lending) and the IBRD, later the World Bank (reconstruction and development).",
      "Triffin's dilemma (1960): the world's need for dollars required US deficits that undermined gold convertibility.",
      "Nixon suspended convertibility on 15 August 1971; major currencies floated by March 1973.",
    ],
    yearStart: 1944,
    yearEnd: 1971,
    location: { lat: 44.25, lon: -71.44, country: "United States" },
    tags: ["monetary system", "imf", "world bank", "exchange rates", "dollar", "gold", "keynes", "nixon shock"],
    recall: [
      { prompt: "What was the essential difference between Keynes's plan and White's?", answer: "Keynes wanted an international clearing union with its own unit (bancor) and penalties on surplus countries; White wanted a fund of national currencies centred on the dollar. White's prevailed because the US held the gold." },
      { prompt: "State the Triffin dilemma.", answer: "To supply the dollars the world needed as reserves, the US had to run deficits, and those deficits eventually undermined confidence that dollars could be converted to gold at 35 dollars an ounce." },
      { prompt: "What happened on 15 August 1971?", answer: "President Nixon suspended the dollar's convertibility into gold, ending the Bretton Woods system of fixed rates; major currencies were floating by 1973." },
      { prompt: "Which two institutions did the conference create?", answer: "The International Monetary Fund and the International Bank for Reconstruction and Development, later the World Bank." },
    ],
    readingMinutes: 7,
    origin: "seeded",
  },
];
