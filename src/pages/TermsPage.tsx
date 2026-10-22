import { Link } from 'react-router-dom';
import LegalPage, { LegalList, LegalSection } from '../components/LegalPage';
import { COMPANY } from '../lib/legal';

const sections: LegalSection[] = [
  {
    title: 'Wat BitBeheer is',
    body: (
      <p>
        {COMPANY.name} is een educatief platform met persoonlijke begeleiding voor beginners die Bitcoin willen kopen en zelf willen bewaren. We leggen uit, denken mee en houden je voortgang bij.
        Door een account aan te maken of de site te gebruiken, ga je akkoord met deze voorwaarden.
      </p>
    ),
  },
  {
    title: 'Geen financieel advies',
    body: (
      <>
        <p>
          Alles op deze site en in onze gesprekken is informatie en educatie. Het is <b>geen beleggingsadvies</b>, geen aanbeveling om iets te kopen of te verkopen en geen belasting- of juridisch
          advies. Het plan en de doelen op je dashboard zijn bedoeld als hulpmiddel en geven geen garantie op een uitkomst.
        </p>
        <p>
          Jij beslist zelf of, wanneer en hoeveel je koopt. Neem alleen een beslissing waar je zelf achter staat en investeer alleen geld waarvan je het verlies kunt dragen.
        </p>
      </>
    ),
  },
  {
    title: "Risico's van Bitcoin",
    body: (
      <LegalList
        items={[
          'De koers van Bitcoin kan sterk schommelen. Je kunt een deel of alles van je inleg verliezen.',
          'Resultaten uit het verleden zeggen niets over de toekomst.',
          'Bitcoin is niet gedekt door een depositogarantie of beleggerscompensatiestelsel.',
          'Transacties op de blockchain zijn niet terug te draaien.',
        ]}
      />
    ),
  },
  {
    title: 'Jouw wallet is van jou',
    body: (
      <>
        <p>
          Wij bewaren nooit je Bitcoin, je seed phrase (herstelwoorden), je pincode of je privésleutel, en wij voeren geen aankopen of overboekingen voor je uit. Je koopt via een aanbieder van jouw
          keuze en bewaart je Bitcoin in je eigen wallet.
        </p>
        <p>
          Deel je seed phrase met niemand, ook niet met ons. Verlies je die, dan is je Bitcoin niet meer terug te halen. Koop een wallet alleen bij de officiële aanbieder via de weg die wij
          aanwijzen. Een wallet van een andere bron of tweedehands kan gemanipuleerd zijn.
        </p>
      </>
    ),
  },
  {
    title: 'Je account',
    body: (
      <LegalList
        items={[
          'Geef juiste gegevens op en houd je inloggegevens geheim. Je bent verantwoordelijk voor wat er met je account gebeurt.',
          'Je bent minimaal 18 jaar.',
          'Wij mogen een account blokkeren of verwijderen bij misbruik, onjuiste gegevens of strijd met deze voorwaarden.',
          'Je kunt je account altijd laten verwijderen via een mail aan ' + COMPANY.email + '.',
        ]}
      />
    ),
  },
  {
    title: 'Afspraken',
    body: (
      <p>
        Een afspraak is pas definitief als wij die bevestigen. Kun je niet, annuleer of verzet dan op tijd. Wij kunnen een afspraak in overleg verplaatsen of annuleren. Het kennismakingsgesprek is
        vrijblijvend.
      </p>
    ),
  },
  {
    title: 'Reeks, badges en jokers',
    body: (
      <p>
        De maandelijkse reeks, badges, niveaus en jokers zijn een leuk hulpmiddel om een vaste gewoonte op te bouwen. Ze zijn geen waardebon en geven geen recht op iets. We kunnen de regels
        aanpassen. Een storting wordt automatisch herkend op het adres van je wallet en kan daardoor soms even duren of gemist worden. Dat heeft geen gevolgen voor je Bitcoin.
      </p>
    ),
  },
  {
    title: 'Links naar andere partijen',
    body: (
      <p>
        Op de site staan links naar andere partijen, zoals aanbieders van wallets en beurzen. Sommige zijn partnerlinks: als je via zo&apos;n link iets koopt, kunnen wij een vergoeding ontvangen.
        Voor jou verandert de prijs daardoor niet. Wij hebben geen invloed op die partijen en zijn niet verantwoordelijk voor hun producten, prijzen of voorwaarden.
      </p>
    ),
  },
  {
    title: 'Beschikbaarheid en aansprakelijkheid',
    body: (
      <>
        <p>
          We doen ons best om de site goed en veilig te laten werken en de informatie juist en actueel te houden, maar kunnen dat niet garanderen. Koersen, saldi en berekeningen kunnen
          afwijken of vertraagd zijn, omdat ze van externe bronnen komen.
        </p>
        <p>
          Voor zover de wet het toestaat, zijn wij niet aansprakelijk voor schade door beslissingen die je neemt op basis van onze informatie, voor koersverlies, voor het verlies van je wallet of
          seed phrase, of voor storingen van externe partijen. Dit geldt niet bij opzet of bewuste roekeloosheid van ons, en tast je wettelijke rechten als consument niet aan.
        </p>
      </>
    ),
  },
  {
    title: 'Privacy',
    body: (
      <p>
        Hoe we met je gegevens omgaan, lees je in onze <Link to="/privacy" className="font-semibold text-orange-600 underline">privacyverklaring</Link>.
      </p>
    ),
  },
  {
    title: 'Toepasselijk recht en wijzigingen',
    body: (
      <p>
        Op deze voorwaarden is Nederlands recht van toepassing. Eventuele geschillen leggen we voor aan de bevoegde rechter in Nederland, tenzij de wet als consument iets anders voor jou bepaalt.
        We kunnen deze voorwaarden wijzigen. De datum bovenaan laat zien wanneer dat voor het laatst is gebeurd. Blijf je de dienst gebruiken na een wijziging, dan ga je daarmee akkoord.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      title="Algemene voorwaarden"
      intro="Dit zijn de afspraken tussen jou en BitBeheer. Kort samengevat: wij begeleiden en leggen uit, jij beslist en bewaart je eigen Bitcoin."
      sections={sections}
    />
  );
}
