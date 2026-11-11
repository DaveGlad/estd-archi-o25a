import { Container } from '@theetiptop-contest/ui/container';
import { Card, CardBody, CardHeader } from '@theetiptop-contest/ui/card';
import { Skeleton } from '@theetiptop-contest/ui/skeleton';

export default function LoadingStatistiques() {
  return (
    <Container className="py-10">
      <span className="sr-only" role="status">
        Chargement des statistiques
      </span>

      <Skeleton className="h-9 w-56" />
      <Skeleton className="mt-3 h-4 w-full max-w-2xl" />

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {[0, 1].map((index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-48" />
            </CardHeader>
            <CardBody>
              <Skeleton className="h-56 w-full" />
            </CardBody>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <Skeleton className="h-5 w-64" />
        </CardHeader>
        <CardBody>
          <Skeleton className="h-72 w-full" />
        </CardBody>
      </Card>
    </Container>
  );
}
