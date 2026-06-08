import { Masthead } from "./components/Masthead";
import { AppShell } from "./components/AppShell";
import { loadDocs, loadHealthHistory, loadLatest, loadSources, loadTopicDiscovery } from "./lib/data";

export const dynamic = "force-static";

export default async function Home() {
  const [docs, sources, latest, topicDiscovery, healthHistory] = await Promise.all([
    loadDocs(),
    loadSources(),
    loadLatest(),
    loadTopicDiscovery(),
    loadHealthHistory(),
  ]);

  return (
    <>
      <Masthead />
      <AppShell docs={docs} sources={sources} latest={latest} topicDiscovery={topicDiscovery} healthHistory={healthHistory} />
    </>
  );
}
