import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';

import { createTask, listTasks } from '../api/tasks';
import { getRole } from '../api/client';
import { ASSIGNABLE_ROLES, type Role, type TaskResponse } from '../types/api';

interface CreateTaskFormValues {
  title: string;
  description: string;
  priority: string;
  dueDate: string | null;
  requiredRole: Role;
}

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Niedrig' },
  { value: 'MEDIUM', label: 'Mittel' },
  { value: 'HIGH', label: 'Hoch' },
];

function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('de-DE');
}

function statusColor(task: TaskResponse): string {
  if (task.completed) return 'green';
  if (task.claimedAt) return 'yellow';
  return 'red';
}

function statusLabel(task: TaskResponse): string {
  if (task.completed) return 'Fertig';
  if (task.claimedAt) return 'In Bearbeitung';
  return 'Zu tun';
}

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

function roleBadge(role: Role) {
  return (
    <Badge color={ROLE_COLOR[role]} variant="light">
      {ROLE_LABEL[role]}
    </Badge>
  );
}

function StatusDot({ color }: { color: string }) {
  return (
    <Box
      w={12}
      h={12}
      style={{ borderRadius: '50%', backgroundColor: `var(--mantine-color-${color}-6)`, flexShrink: 0 }}
    />
  );
}

function statusBadge(task: TaskResponse) {
  return (
    <Badge color={statusColor(task)} variant="light">
      {statusLabel(task)}
    </Badge>
  );
}

export default function TasksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = getRole();
  const isAdmin = role === 'ADMIN';
  const [createOpen, setCreateOpen] = useState(false);

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: listTasks,
  });

  const form = useForm<CreateTaskFormValues>({
    initialValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      dueDate: null,
      requiredRole: 'TECHNIKER',
    },
    validate: {
      title: (value) => (value.trim().length === 0 ? 'Titel ist erforderlich' : null),
      requiredRole: (value) => (value ? null : 'Rolle ist erforderlich'),
    },
  });

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      notifications.show({ color: 'green', title: 'Task erstellt', message: 'Task wurde angelegt' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setCreateOpen(false);
      form.reset();
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht erstellt werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  function handleSubmit(values: CreateTaskFormValues) {
    createMutation.mutate({
      title: values.title.trim(),
      description: values.description.trim() || undefined,
      priority: values.priority || undefined,
      dueDate: values.dueDate ? values.dueDate : undefined,
      requiredRole: values.requiredRole,
    });
  }

  if (tasksQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (tasksQuery.isError) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Tasks konnten nicht geladen werden.</Text>
          <Button onClick={() => tasksQuery.refetch()}>Erneut versuchen</Button>
        </Stack>
      </Center>
    );
  }

  const tasks = tasksQuery.data ?? [];

  return (
    <Container size="lg" py="xl">
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Title order={2}>Tasks</Title>
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>Task erstellen</Button>
          )}
        </Group>

        {tasks.length === 0 ? (
          <Card withBorder padding="xl" radius="md">
            <Stack align="center" gap="md">
              <Title order={4}>Noch keine Tasks vorhanden</Title>
              <Text c="dimmed" ta="center">
                {isAdmin
                  ? 'Lege den ersten Task an, um loszulegen.'
                  : 'Aktuell sind dir keine Tasks zugewiesen.'}
              </Text>
              {isAdmin && (
                <Button onClick={() => setCreateOpen(true)}>Ersten Task erstellen</Button>
              )}
            </Stack>
          </Card>
        ) : (
          <Card withBorder padding={0} radius="md">
            <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Titel</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Priorität</Table.Th>
                  <Table.Th>Behebergruppe</Table.Th>
                  <Table.Th>Fällig</Table.Th>
                  <Table.Th>Zugewiesen</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tasks.map((task) => (
                  <Table.Tr
                    key={task.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                  >
                    <Table.Td>
                      <Group gap="sm" align="flex-start" wrap="nowrap">
                        <Box pt={6}>
                          <StatusDot color={statusColor(task)} />
                        </Box>
                        <Stack gap={2}>
                          <Text fw={500}>{task.title}</Text>
                          {task.description && (
                            <Text size="xs" c="dimmed" lineClamp={2}>
                              {task.description}
                            </Text>
                          )}
                        </Stack>
                      </Group>
                    </Table.Td>
                    <Table.Td>{statusBadge(task)}</Table.Td>
                    <Table.Td>{task.priority ?? '-'}</Table.Td>
                    <Table.Td>{roleBadge(task.requiredRole)}</Table.Td>
                    <Table.Td>{formatDate(task.dueDate)}</Table.Td>
                    <Table.Td>{task.assignee?.username ?? '-'}</Table.Td>
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
        title="Neuen Task erstellen"
        centered
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Titel"
              placeholder="Was ist zu tun?"
              required
              {...form.getInputProps('title')}
            />
            <Textarea
              label="Beschreibung"
              placeholder="Optionale Details"
              autosize
              minRows={2}
              {...form.getInputProps('description')}
            />
            <Select
              label="Priorität"
              data={PRIORITY_OPTIONS}
              {...form.getInputProps('priority')}
            />
            <DateInput
              label="Fällig am"
              placeholder="Datum wählen"
              clearable
              valueFormat="DD.MM.YYYY"
              {...form.getInputProps('dueDate')}
            />
            <Select
              label="Behebergruppe"
              data={ASSIGNABLE_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
              required
              {...form.getInputProps('requiredRole')}
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
