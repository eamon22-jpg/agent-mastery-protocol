import { BowViewer } from '@/components/bow-viewer';
import { KunaiViewer } from '@/components/kunai-viewer';
import { TurretViewer } from '@/components/turret-viewer';

const mockups = [
  {
    agent: 'Jett',
    title: 'Specialist’s Knives',
    description: 'A visible marker of the movement and mechanical control that define dedicated Jett play. The finish preserves the knives’ familiar combat silhouette.',
    className: 'knife-stage',
    viewer: <KunaiViewer />,
  },
  {
    agent: 'Sova',
    title: 'Trueflight',
    description: 'A reward tied to the information and team setup that skilled Sova players provide. The treatment keeps every essential visual cue intact.',
    className: 'bow-stage',
    viewer: <BowViewer />,
  },
  {
    agent: 'Killjoy',
    title: 'Masterwork Turret',
    description: 'A reward for the preparation and space control behind strong Killjoy play. Its shape and the information it gives other players remain unchanged.',
    className: 'turret-stage',
    viewer: <TurretViewer />,
  },
];

export default function Home() {
  return (
    <main className="simple-page">
      <section className="idea-copy" aria-label="Agent mastery concept">
        <p className="opening-statement">
          A bad night in VALORANT can make hours of play feel wasted. Your rank falls, your team struggles, and the effort you put into mastering an agent has little lasting value.
        </p>
        <p className="byline">A concept by Eamon Bonner</p>
        <p className="credibility">VALORANT player since closed beta · Peak rank #533 in North America</p>

        <div className="idea-section">
          <p className="section-label">The idea</p>
          <p className="idea-statement">
            Give every agent a persistent mastery path that rewards commitment, role knowledge, and decisions that help the team.
          </p>
        </div>

        <p className="mockup-intro">Three rewards for three forms of agent mastery.</p>
        <p className="project-meta">Concept by Eamon Bonner · Interactive concept prototype · 2026</p>
      </section>

      <section className="mockups" aria-label="Interactive cosmetic mockups">
        {mockups.map((mockup) => (
          <figure className="mockup" key={mockup.agent}>
            <div className={`model-stage ${mockup.className}`}>{mockup.viewer}</div>
            <figcaption>
              <p>{mockup.agent}</p>
              <h2>{mockup.title}</h2>
              <span>{mockup.description}</span>
            </figcaption>
          </figure>
        ))}
      </section>

      <section className="principles" aria-labelledby="principles-heading">
        <p className="section-label" id="principles-heading">Constraints I designed around</p>
        <div className="principle-list">
          <article>
            <h2>Earned, not purchased</h2>
            <p>Only agent mastery unlocks these rewards, so they remain proof of play.</p>
          </article>
          <article>
            <h2>Team-aligned</h2>
            <p>Progress rules connect role actions to team value, not isolated statistics.</p>
          </article>
          <article>
            <h2>Competitively clear</h2>
            <p>Each treatment preserves timing, visibility, hitboxes, and essential cues.</p>
          </article>
        </div>
      </section>

      <footer className="closing">
        <p>
          I have played VALORANT since closed beta and reached rank 533 in North America. I want players to feel that the time they invest in an agent still matters, even when their rank moves in the wrong direction.
        </p>
        <div className="signature">
          <strong>Eamon Bonner</strong>
          <a href="mailto:eamonbonner22@gmail.com">eamonbonner22@gmail.com</a>
          <span>Bellingham, WA</span>
        </div>
      </footer>
    </main>
  );
}
