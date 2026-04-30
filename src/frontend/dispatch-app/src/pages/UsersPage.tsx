import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  PasswordInput,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { createUser, listUsers } from '../api/users';
import { getRole } from '../api/client';
import type { Role } from '../types/api';

interface CreateUserFormValues {
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: Role;
}

const ALL_ROLES: Role[] = ['ADMIN', 'TECHNIKER', 'HAUSMEISTER', 'ITSUPPORT'];

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Admin',
  TECHNIKER: 'Techniker',
  HAUSMEISTER: 'Hausmeister',
  ITSUPPORT: 'IT-Support',
};

const ROLE_COLOR: Record<Role, string> = {
  ADMIN: 'gray',
  TECHNIKER: 'blue',
  HAUSMEISTER: 'orange',
  ITSUPPORT: 'cyan',
};

export default function UsersPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = getRole();
  const isAdmin = role === 'ADMIN';
  const [createOpen, setCreateOpen] = useState(false);

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: isAdmin,
  });

  const form = useForm<CreateUserFormValues>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      phoneNumber: '',
      role: 'TECHNIKER',
    },
    validate: {
      username: (value) =>
        value.trim().length === 0 ? 'Benutzername ist erforderlich' : null,
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : 'Bitte gültige Email eingeben',
      password: (value) =>
        value.length < 8 ? 'Passwort muss mindestens 8 Zeichen lang sein' : null,
      role: (value) => (value ? null : 'Rolle ist erforderlich'),
    },
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      notifications.show({
        color: 'green',
        title: 'Account erstellt',
        message: 'Der neue Benutzer wurde angelegt',
      });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setCreateOpen(false);
      form.reset();
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) ||
        'Account konnte nicht erstellt werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  function handleSubmit(values: CreateUserFormValues) {
    createMutation.mutate({
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
      role: values.role,
      phoneNumber: values.phoneNumber.trim() || undefined,
    });
  }

  if (!isAdmin) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Nur Admins können Benutzer verwalten.</Text>
          <Button onClick={() => navigate('/tasks')}>Zu den Tasks</Button>
        </Stack>
      </Center>
    );
  }

  if (usersQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (usersQuery.isError) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Benutzer konnten nicht geladen werden.</Text>
          <Button onClick={() => usersQuery.refetch()}>Erneut versuchen</Button>
        </Stack>
      </Center>
    );
  }

  const users = usersQuery.data ?? [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Benutzer</Title>
          <Button onClick={() => setCreateOpen(true)}>Account erstellen</Button>
        </Group>

        {users.length === 0 ? (
          <Card withBorder padding="xl" radius="md">
            <Stack align="center" gap="md">
              <Title order={4}>Noch keine Benutzer</Title>
              <Text c="dimmed">Lege den ersten Account an.</Text>
              <Button onClick={() => setCreateOpen(true)}>Ersten Account erstellen</Button>
            </Stack>
          </Card>
        ) : (
          <Card withBorder padding={0} radius="md">
            <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Benutzername</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Rolle</Table.Th>
                  <Table.Th>Telefon</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {users.map((user) => (
                  <Table.Tr
                    key={user.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/users/${user.id}`)}
                  >
                    <Table.Td>
                      <Text fw={500}>{user.username}</Text>
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={ROLE_COLOR[user.role]} variant="light">
                        {ROLE_LABEL[user.role]}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{user.phoneNumber ?? '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Card>
        )}
      </Stack>

      <Modal
        opened={createOpen}
        onClose={() => {
          setCreateOpen(false);
          form.reset();
        }}
        title="Neuen Account erstellen"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Benutzername"
              placeholder="z.B. max.mustermann"
              required
              {...form.getInputProps('username')}
            />
            <TextInput
              label="Email"
              placeholder="user@example.com"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label="Passwort"
              placeholder="Mindestens 8 Zeichen"
              required
              {...form.getInputProps('password')}
            />
            <TextInput
              label="Telefon (optional)"
              placeholder="+49..."
              {...form.getInputProps('phoneNumber')}
            />
            <Select
              label="Rolle"
              data={ALL_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
              required
              {...form.getInputProps('role')}
            />
            <Group justify="flex-end" gap="sm" mt="sm">
              <Button
                variant="subtle"
                onClick={() => {
                  setCreateOpen(false);
                  form.reset();
                }}
              >
                Abbrechen
              </Button>
              <Button type="submit" loading={createMutation.isPending}>
                Erstellen
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Container>
  );
}
