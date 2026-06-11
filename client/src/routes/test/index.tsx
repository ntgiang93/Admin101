import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/test/')({
  component: RouteComponent,
})
function RouteComponent() {
  ;<h1>Tesst</h1>
}
