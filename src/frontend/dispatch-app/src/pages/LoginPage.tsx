import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Center,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { isAxiosError } from 'axios';

import { login } from '../api/auth';
import { setToken } from '../api/client';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<LoginFormValues>({
    initialValues: { email: '', password: '' },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : 'Bitte gueltige Email eingeben',
      password: (value) =>
        value.length === 0 ? 'Passwort darf nicht leer sein' : null,
    },
  });

  async function handleSubmit(values: LoginFormValues) {
    setSubmitting(true);
    try {
      const res = await login(values);
      setToken(res.token);
      navigate('/tasks', { replace: true });
    } catch (err) {
      const message =
        (isAxiosError(err) && err.response?.data?.error) ||
        (isAxiosError(err) && err.response?.status === 401
          ? 'Email oder Passwort falsch'
          : null) ||
        'Login fehlgeschlagen';
      notifications.show({
        color: 'red',
        title: 'Login fehlgeschlagen',
        message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Center h="100vh" px="md">
      <Card withBorder shadow="sm" padding="xl" radius="md" w={400} maw="100%">
        <Stack gap="md">
          <Title order={2} ta="center">
            Dispatch Login
          </Title>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="admin@example.com"
                autoComplete="username"
                required
                {...form.getInputProps('email')}
              />
              <PasswordInput
                label="Passwort"
                placeholder="********"
                autoComplete="current-password"
                required
                {...form.getInputProps('password')}
              />
              <Button type="submit" loading={submitting} fullWidth>
                Anmelden
              </Button>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Center>
  );
}
