import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dialog } from '../../atoms/Dialog';
import { useFormUid } from '@autospace/forms/src/createUid';
import { Form } from '../../atoms/Form';
import { HtmlLabel } from '../../atoms/HtmlLabel';
import { HtmlInput } from '../../atoms/HtmlInput';
import { useMutation } from '@apollo/client';
import {
  CreateAdminDocument,
  namedOperations,
} from '@autospace/network/src/gql/generated';

export const CreateAdmin = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit } = useFormUid();
  const [createAdmin, { loading }] = useMutation(CreateAdminDocument, {
    awaitRefetchQueries: true,
    refetchQueries: [namedOperations.Query.admins],
  });
  return (
    <>
      <Button onClick={() => setOpen(true)}>Create admin</Button>
      <Dialog open={open} setOpen={setOpen} title={'Create admin'}>
        <Form
          onSubmit={handleSubmit(async ({ id }) => {
            await createAdmin({
              variables: { createAdminInput: { id } },
            });
            setOpen(false);
          })}
        >
          <HtmlLabel title="id">
            <HtmlInput placeholder="id" {...register('id')} />
          </HtmlLabel>

          <Button loading={loading} type="submit">
            Create
          </Button>
        </Form>
      </Dialog>
    </>
  );
};
