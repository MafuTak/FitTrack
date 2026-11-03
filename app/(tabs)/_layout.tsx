import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';

import { Palette } from '@/constants/theme';
import { AlunosProvider } from '@/context/AlunosContext';

function TabBarIcon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return (
    <FontAwesome size={21} name={name} color={color} style={{ marginBottom: -2 }} />
  );
}

export default function TabLayout() {
  return (
    <AlunosProvider>
      <Tabs
        initialRouteName="index"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: Palette.orangeLight,
          tabBarInactiveTintColor: Palette.textFaint,
          tabBarStyle: {
            backgroundColor: Palette.tabBar,
            borderTopColor: Palette.borderSoft,
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Início',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="AlunosCadastro"
          options={{
            title: 'Cadastro',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="user-plus" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="AvaliacaoScreen"
          options={{
            title: 'Avaliação',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="clipboard" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="ListaAlunos"
          options={{
            title: 'Alunos',
            tabBarIcon: ({ color }) => <TabBarIcon name="users" color={color} />,
          }}
        />
        <Tabs.Screen
          name="CriarSerieScreen"
          options={{
            title: 'Criar',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="plus-square" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="VerSerieScreen"
          options={{
            title: 'Séries',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
      </Tabs>
    </AlunosProvider>
  );
}
