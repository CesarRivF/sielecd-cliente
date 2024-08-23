import { Center, Stack } from "@mantine/core";
import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <>
      <Center>
        <Stack>
          <h1>Oops!</h1>
          <p>Esta página no existe.</p>
        </Stack>
      </Center>
    </>
  );
}
