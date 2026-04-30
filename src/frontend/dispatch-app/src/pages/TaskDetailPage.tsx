import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Anchor,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Container,
  Divider,
  Group,
  Loader,
  Modal,
  Select,
  Stack,
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

import {
  assignTask,
  claimTask,
  completeTask,
  deleteTask,
  getTask,
  releaseTask,
  updateTask,
} from '../api/tasks';
import { listUsers } from '../api/users';
import { getEmail, getRole } from '../api/client';
import { ASSIGNABLE_ROLES, type Role, type TaskResponse } from '../types/api';

interface EditTaskFormValues {
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

function formatDateTime(value: string | null): string {
  if (!value) return '-';
  return new Date(value).toLocaleString('de-DE');
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Box>{children}</Box>
    </Stack>
  );
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const taskId = Number(id);
  const role = getRole();
  const myEmail = getEmail();
  const isAdmin = role === 'ADMIN';
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState<string | null>(null);

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTask(taskId),
    enabled: Number.isFinite(taskId),
  });

  const form = useForm<EditTaskFormValues>({
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

  function openEdit() {
    if (!taskQuery.data) return;
    const t = taskQuery.data;
    form.setValues({
      title: t.title,
      description: t.description ?? '',
      priority: t.priority ?? 'MEDIUM',
      dueDate: t.dueDate ?? null,
      requiredRole: t.requiredRole,
    });
    form.resetDirty();
    setEditOpen(true);
  }

  const updateMutation = useMutation({
    mutationFn: (values: EditTaskFormValues) =>
      updateTask(taskId, {
        title: values.title.trim(),
        description: values.description.trim() || undefined,
        priority: values.priority || undefined,
        dueDate: values.dueDate ?? undefined,
        requiredRole: values.requiredRole,
      }),
    onSuccess: (data) => {
      notifications.show({ color: 'green', title: 'Gespeichert', message: 'Task aktualisiert' });
      queryClient.setQueryData(['task', taskId], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditOpen(false);
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht aktualisiert werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: listUsers,
    enabled: isAdmin && assignOpen,
  });

  const completeMutation = useMutation({
    mutationFn: () => completeTask(taskId),
    onSuccess: (data) => {
      notifications.show({ color: 'green', title: 'Erledigt', message: 'Task abgeschlossen' });
      queryClient.setQueryData(['task', taskId], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) ||
        'Task konnte nicht abgeschlossen werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  const assignMutation = useMutation({
    mutationFn: (userId: number) => assignTask(taskId, { userId }),
    onSuccess: (data) => {
      notifications.show({ color: 'green', title: 'Zugewiesen', message: 'Task wurde zugewiesen' });
      queryClient.setQueryData(['task', taskId], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setAssignOpen(false);
      setAssignUserId(null);
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht zugewiesen werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  const claimMutation = useMutation({
    mutationFn: () => claimTask(taskId),
    onSuccess: (data) => {
      notifications.show({ color: 'green', title: 'Übernommen', message: 'Task wurde dir zugewiesen' });
      queryClient.setQueryData(['task', taskId], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht übernommen werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  const releaseMutation = useMutation({
    mutationFn: () => releaseTask(taskId),
    onSuccess: (data) => {
      notifications.show({ color: 'green', title: 'Ausgetragen', message: 'Task wurde freigegeben' });
      queryClient.setQueryData(['task', taskId], data);
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht freigegeben werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTask(taskId),
    onSuccess: () => {
      notifications.show({ color: 'green', title: 'Gelöscht', message: 'Task wurde gelöscht' });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.removeQueries({ queryKey: ['task', taskId] });
      setDeleteOpen(false);
      navigate('/tasks', { replace: true });
    },
    onError: (err) => {
      const message =
        (isAxiosError(err) && err.response?.data?.error) || 'Task konnte nicht gelöscht werden';
      notifications.show({ color: 'red', title: 'Fehler', message });
    },
  });

  useEffect(() => {
    if (!editOpen) form.reset();
  }, [editOpen]);

  if (taskQuery.isLoading) {
    return (
      <Center mih="60vh">
        <Loader />
      </Center>
    );
  }

  if (taskQuery.isError || !taskQuery.data) {
    return (
      <Center mih="60vh" px="md">
        <Stack align="center" gap="md">
          <Text c="red">Task konnte nicht geladen werden.</Text>
          <Button onClick={() => navigate('/tasks')}>Zurück zur Liste</Button>
        </Stack>
      </Center>
    );
  }

  const task = taskQuery.data;

  const canClaim =
    !task.completed &&
    !task.assignee &&
    !!role &&
    role === task.requiredRole;

  const canRelease =
    !task.completed &&
    !!task.assignee &&
    (isAdmin || (myEmail !== null && task.assignee.email === myEmail));

  const canComplete =
    !task.completed &&
    !!task.assignee &&
    (isAdmin || (myEmail !== null && task.assignee.email === myEmail));

  const canAssign = isAdmin && !task.completed;

  return (
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Anchor onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
          &larr; Zurück zur Liste
        </Anchor>

        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Stack gap={4}>
            <Title order={2}>{task.title}</Title>
            <Text size="sm" c="dimmed">
              Task #{task.id}
            </Text>
          </Stack>
          <Group gap="sm" align="center" wrap="nowrap">
            <Badge color={statusColor(task)} size="lg" variant="light">
              {statusLabel(task)}
            </Badge>
            {canClaim && (
              <Button
                color="green"
                loading={claimMutation.isPending}
                onClick={() => claimMutation.mutate()}
              >
                Übernehmen
              </Button>
            )}
            {canComplete && (
              <Button
                color="teal"
                loading={completeMutation.isPending}
                onClick={() => completeMutation.mutate()}
              >
                Erledigen
              </Button>
            )}
            {canRelease && (
              <Button
                variant="light"
                color="orange"
                loading={releaseMutation.isPending}
                onClick={() => releaseMutation.mutate()}
              >
                Austragen
              </Button>
            )}
            {canAssign && (
              <Button
                variant="default"
                onClick={() => {
                  setAssignUserId(task.assignee ? String(task.assignee.id) : null);
                  setAssignOpen(true);
                }}
              >
                {task.assignee ? 'Neu zuweisen' : 'Zuweisen'}
              </Button>
            )}
            {isAdmin && (
              <>
                <Button variant="default" onClick={openEdit}>
                  Bearbeiten
                </Button>
                <Button color="red" variant="light" onClick={() => setDeleteOpen(true)}>
                  Löschen
                </Button>
              </>
            )}
          </Group>
        </Group>

        <Card withBorder padding="lg" radius="md">
          <Stack gap="md">
            <Field label="Beschreibung">
              <Text>{task.description || <Text span c="dimmed">Keine Beschreibung</Text>}</Text>
            </Field>

            <Divider />

            <Group grow align="flex-start">
              <Field label="Priorität">
                <Text>{task.priority ?? '-'}</Text>
              </Field>
              <Field label="Behebergruppe">
                <Badge color={ROLE_COLOR[task.requiredRole]} variant="light" size="md">
                  {ROLE_LABEL[task.requiredRole]}
                </Badge>
              </Field>
              <Field label="Fällig am">
                <Text>{formatDate(task.dueDate)}</Text>
              </Field>
            </Group>

            <Divider />

            <Group grow align="flex-start">
              <Field label="Zugewiesen an">
                {task.assignee ? (
                  <Stack gap={0}>
                    <Text>{task.assignee.username}</Text>
                    <Text size="xs" c="dimmed">
                      {task.assignee.email}
                    </Text>
                  </Stack>
                ) : (
                  <Text c="dimmed">Niemand</Text>
                )}
              </Field>
              <Field label="Erstellt von">
                {task.createdBy ? (
                  <Stack gap={0}>
                    <Text>{task.createdBy.username}</Text>
                    <Text size="xs" c="dimmed">
                      {task.createdBy.email}
                    </Text>
                  </Stack>
                ) : (
                  <Text c="dimmed">-</Text>
                )}
              </Field>
            </Group>

            <Divider />

            <Group grow align="flex-start">
              <Field label="Erstellt">
                <Text>{formatDateTime(task.createdAt)}</Text>
              </Field>
              <Field label="Übernommen">
                <Text>{formatDateTime(task.claimedAt)}</Text>
              </Field>
              <Field label="Abgeschlossen">
                <Text>{formatDateTime(task.completedAt)}</Text>
              </Field>
            </Group>
          </Stack>
        </Card>
      </Stack>

      <Modal
        opened={editOpen}
        onClose={() => setEditOpen(false)}
        title="Task bearbeiten"
        centered
      >
        <form onSubmit={form.onSubmit((values) => updateMutation.mutate(values))}>
          <Stack gap="md">
            <TextInput label="Titel" required {...form.getInputProps('title')} />
            <Textarea
              label="Beschreibung"
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
              <Button variant="subtle" onClick={() => setEditOpen(false)}>
                Abbrechen
              </Button>
              <Button type="submit" loading={updateMutation.isPending}>
                Speichern
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      <Modal
        opened={assignOpen}
        onClose={() => {
          setAssignOpen(false);
          setAssignUserId(null);
        }}
        title="Task zuweisen"
        centered
      >
        <Stack gap="md">
          {usersQuery.isLoading ? (
            <Center py="md">
              <Loader />
            </Center>
          ) : usersQuery.isError ? (
            <Text c="red">Benutzer konnten nicht geladen werden.</Text>
          ) : (
            <>
              <Text size="sm" c="dimmed">
                Auswahl auf Benutzer mit Rolle {ROLE_LABEL[task.requiredRole]} beschränkt.
              </Text>
              <Select
                label="Benutzer"
                placeholder="Benutzer auswählen"
                searchable
                nothingFoundMessage="Kein passender Benutzer"
                data={(usersQuery.data ?? [])
                  .filter((u) => u.role === task.requiredRole)
                  .map((u) => ({ value: String(u.id), label: `${u.username} (${u.email})` }))}
                value={assignUserId}
                onChange={setAssignUserId}
              />
              <Group justify="flex-end" gap="sm">
                <Button
                  variant="subtle"
                  onClick={() => {
                    setAssignOpen(false);
                    setAssignUserId(null);
                  }}
                >
                  Abbrechen
                </Button>
                <Button
                  loading={assignMutation.isPending}
                  disabled={!assignUserId}
                  onClick={() => {
                    if (assignUserId) assignMutation.mutate(Number(assignUserId));
                  }}
                >
                  Zuweisen
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      <Modal
        opened={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Task löschen?"
        centered
      >
        <Stack gap="md">
          <Text>
            Soll der Task <Text span fw={600}>{task.title}</Text> wirklich gelöscht werden? Diese
            Aktion kann nicht rückgängig gemacht werden.
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="subtle" onClick={() => setDeleteOpen(false)}>
              Abbrechen
            </Button>
            <Button
              color="red"
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Löschen
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}
