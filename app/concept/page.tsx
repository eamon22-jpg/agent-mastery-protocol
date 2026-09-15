import type { Metadata } from 'next';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'The Concept | Agent Mastery Reward',
  description:
    'The problem, progression system, rewards, and competitive constraints behind Agent Mastery Protocol.',
};

export default function ConceptPage() {
  return (
    <main className="concept-page">
      <a className="concept-back" href="./">
        <span aria-hidden="true">←</span> Interactive concepts
      </a>

      <header className="concept-header">
        <p className="section-label">The full concept</p>
        <h1>Agent Mastery Protocol</h1>
        <p className="concept-deck">
          An interactive concept for a more meaningful agent mastery system in
          VALORANT.
        </p>
        <p className="concept-author">Concept by Eamon Bonner</p>
      </header>

      <article className="concept-body">
        <section>
          <h2>The problem</h2>
          <p>
            Competitive rank gives VALORANT players a clear goal, but it can
            also make a difficult session feel wasted. A player can improve,
            deepen their knowledge of an agent, and make good decisions without
            seeing that progress in their rank.
          </p>
          <p>
            This can lead to player burnout, negatively affecting user
            retention.
          </p>
        </section>

        <section>
          <h2>The concept</h2>
          <p>
            Agent Mastery Protocol expands Agent Gear into a long-term
            progression path for each agent. Players earn progress through
            matches, wins, and challenges that reflect the agent&apos;s role.
          </p>
          <p>
            The system rewards useful play instead of isolated statistics. A
            Sova challenge could reward openings created through Recon Bolt,
            rather than the number of scans alone. This structure encourages
            players to understand their role and help their team.
          </p>
        </section>

        <section>
          <h2>The rewards</h2>
          <p>
            Agent mastery unlocks distinctive cosmetics that cannot be
            purchased. These rewards give players a visible way to show their
            connection to an agent.
          </p>
          <p>This prototype explores three examples:</p>
          <ul>
            <li>
              <strong>Specialist&apos;s Knives</strong> for Jett
            </li>
            <li>
              <strong>Trueflight</strong> for Sova
            </li>
            <li>
              <strong>Masterwork Turret</strong> for Killjoy
            </li>
          </ul>
          <p>
            Each model supports click-and-drag rotation and manual zoom
            controls.
          </p>
        </section>

        <section>
          <h2>Design constraints</h2>
          <p>Every reward follows three rules:</p>
          <ul>
            <li>
              <strong>Earned, not purchased:</strong> Only agent mastery
              unlocks the reward.
            </li>
            <li>
              <strong>Team-aligned:</strong> Progress reflects decisions that
              help the team.
            </li>
            <li>
              <strong>Competitively clear:</strong> Cosmetics preserve timing,
              hitboxes, visibility, and essential cues.
            </li>
          </ul>
          <p>
            I want to give players another reason to care when they queue for a
            match. Rank can rise or fall, but the effort a player invests in an
            agent should still matter.
          </p>
        </section>
      </article>

      <p className="concept-disclaimer">
        This is an independent design concept. It is not affiliated with or
        endorsed by Riot Games.
      </p>
    </main>
  );
}
