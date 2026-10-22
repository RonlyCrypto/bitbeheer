import { Link } from 'react-router-dom';
import LegalPage, { LegalList, LegalSection } from '../components/LegalPage';
import { COMPANY } from '../lib/legal';

const sections: LegalSection[] = [
  {
    title: 'Wie zijn wij',
    body: (
      <p>
        {COMPANY.name} ({COMPANY.website}) begeleidt beginners bij het kopen en bewaren van Bitcoin. Wij zijn de verantwoordelijke voor de verwerking van je persoonsgegevens zoals
        hieronder beschreven. Vragen? Mail naar {COMPANY.email}.
      </p>
    ),
  },
  {
    title: 'Welke gegevens we verwerken en waarom',
    body: (
      <LegalList
        items={[
          <><b>Account:</b> naam, e-mailadres en je versleutelde wachtwoord (wij kunnen je wachtwoord niet lezen). Optioneel telefoonnummer en woonplaats. Nodig om je een account en toegang te geven.</>,
          <><b>Afspraken en chat:</b> de gekozen datum en tijd, je opmerkingen en je berichten aan ons. Nodig om je gesprek te plannen en vragen te beantwoorden.</>,
          <><b>Begeleiding:</b> je voortgang (bijvoorbeeld afspraak gehad, wallet besteld en ontvangen), het gekozen walletmodel, besteldatum en ontvangstdatum, je plan (maandbedrag, looptijd, doel) en je instellingen voor maandelijkse stortingen, reeks, badges en jokers. Nodig om de begeleiding uit te voeren.</>,
          <><b>Wallet-adres:</b> het openbare Bitcoin-ontvangstadres dat je koppelt, en het saldo en de transacties die daar openbaar op de blockchain bij horen. Wij vragen nooit om je seed phrase (herstelwoorden), pincode of privésleutel en kunnen niets van je wallet opnemen.</>,
          <><b>Meldingen:</b> als je pushmeldingen aanzet, bewaren we de technische gegevens van je toestel of browser die nodig zijn om een melding te sturen. Alleen na jouw toestemming in je browser of telefoon.</>,
          <><b>E-mail:</b> berichten over je account, afspraken en, als je dat aanzet, herinneringen voor je maandelijkse storting.</>,
          <><b>Bezoek van de site:</b> welke pagina&apos;s worden bezocht, waar het bezoek vandaan komt (verwijzende site), type browser, toestel, besturingssysteem, taal en tijdzone, gekoppeld aan een willekeurig nummer dat in je browser staat. Wij slaan hiervoor geen IP-adres of plaats op. Dit gebruiken we om de site te verbeteren.</>,
        ]}
      />
    ),
  },
  {
    title: 'Op welke grondslag',
    body: (
      <LegalList
        items={[
          <><b>Uitvoering van de overeenkomst:</b> account, afspraken, chat en begeleiding.</>,
          <><b>Toestemming:</b> pushmeldingen en herinneringsmails. Je kunt die toestemming altijd intrekken, zie hieronder.</>,
          <><b>Gerechtvaardigd belang:</b> beveiliging van de site en het meten van bezoek in beperkte vorm om de site te verbeteren.</>,
          <><b>Wettelijke plicht:</b> als de wet ons verplicht gegevens te bewaren of te delen.</>,
        ]}
      />
    ),
  },
  {
    title: 'Met wie we gegevens delen',
    body: (
      <>
        <p>We verkopen je gegevens niet. We gebruiken wel partijen die ons helpen de dienst te leveren (verwerkers):</p>
        <LegalList
          items={[
            <><b>Supabase</b> voor de database, inloggen en serverfuncties. De gegevens staan in een datacenter in de EU (Ierland).</>,
            <><b>Vercel</b> voor het hosten van de website.</>,
            <><b>Resend</b> voor het versturen van e-mail.</>,
            <><b>Blockstream</b> (blockstream.info): voor het ophalen van saldo en transacties sturen we je openbare wallet-adres naar deze blockchain-dienst. Het adres is openbaar, maar wordt daarmee wel aan een extern bedrijf getoond.</>,
            <><b>CoinGecko</b> (of een vergelijkbare prijsdienst) voor de Bitcoin-koers. Hierbij worden geen persoonsgegevens van jou meegestuurd.</>,
          ]}
        />
        <p>
          Sommige van deze partijen zitten buiten de EU of kunnen gegevens daar verwerken. Waar dat zo is, gelden de standaardcontractbepalingen of een gelijkwaardige waarborg van de EU.
        </p>
        <p>
          Op de site staan links naar andere partijen, zoals Ledger en Coinbase. Zodra je daarop klikt, geldt het privacybeleid van die partij.
        </p>
      </>
    ),
  },
  {
    title: 'Cookies en opslag in je browser',
    body: (
      <p>
        We gebruiken geen advertentie- of volgcookies. Wel bewaren we in je browser wat nodig is om te werken: je inlogsessie, je voorkeuren (zoals tekstgrootte), welke meldingen je al hebt gezien
        en het willekeurige nummer voor het meten van bezoek. Je kunt dit altijd wissen via de instellingen van je browser.
      </p>
    ),
  },
  {
    title: 'Hoe lang we gegevens bewaren',
    body: (
      <>
        <p>
          We bewaren je gegevens zolang je account bestaat en je begeleiding loopt. Een account dat niet wordt geverifieerd, wordt na de verlooptermijn automatisch verwijderd. Verwijder je je
          account of vraag je ons dat te doen, dan wissen we je gegevens, behalve wat we wettelijk langer moeten bewaren.
        </p>
        <p>Gegevens van bezoekmetingen bewaren we niet langer dan nodig is om de site te verbeteren.</p>
      </>
    ),
  },
  {
    title: 'Hoe we je gegevens beschermen',
    body: (
      <p>
        De verbinding met de site is versleuteld. Gegevens staan achter toegangsregels, zodat je alleen je eigen gegevens kunt zien. Beheer van de site is beveiligd met een tweede inlogstap. Ondanks
        deze maatregelen bestaat nooit honderd procent zekerheid. Merk je iets verdachts op, laat het ons direct weten.
      </p>
    ),
  },
  {
    title: 'Jouw rechten',
    body: (
      <>
        <p>Je hebt het recht om:</p>
        <LegalList
          items={[
            'je gegevens in te zien en een kopie te krijgen;',
            'onjuiste gegevens te laten verbeteren;',
            'je gegevens te laten verwijderen;',
            'de verwerking te laten beperken of bezwaar te maken;',
            'je gegevens mee te nemen naar een andere partij;',
            'toestemming die je hebt gegeven weer in te trekken, zoals pushmeldingen (via je browser of telefoon, of met "Herinneringen uitzetten" op je dashboard) en herinneringsmails.',
          ]}
        />
        <p>
          Mail ons op {COMPANY.email}. We reageren binnen een maand. Ben je het niet eens met hoe we met je gegevens omgaan, dan kun je een klacht indienen bij de Autoriteit Persoonsgegevens
          (autoriteitpersoonsgegevens.nl).
        </p>
      </>
    ),
  },
  {
    title: 'Wijzigingen',
    body: (
      <p>
        We kunnen deze verklaring aanpassen, bijvoorbeeld als de dienst verandert. De datum bovenaan laat zien wanneer dit voor het laatst is gebeurd. Zie ook onze{' '}
        <Link to="/voorwaarden" className="font-semibold text-orange-600 underline">voorwaarden</Link>.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacyverklaring"
      intro="Hier lees je welke gegevens wij van je verwerken, waarom, en wat je zelf kunt doen. We houden het kort en zonder juridisch jargon."
      sections={sections}
    />
  );
}
