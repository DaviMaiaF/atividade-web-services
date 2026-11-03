import { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

type Publicacao = {
  id: number;
  title: string;
  body: string;
};

const URL_BASE = 'https://jsonplaceholder.typicode.com/posts';

export default function App() {
  const [publicacao, setPublicacao] = useState<Publicacao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [contador, setContador] = useState(1);
  const [mensagem, setMensagem] = useState('');

  async function requisitar(
    metodo: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    id?: number,
    corpo?: Partial<Publicacao>
  ) {
    try {
      setCarregando(true);
      setErro(null);

      const url = id ? `${URL_BASE}/${id}` : URL_BASE;
      const resposta = await fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        body: corpo ? JSON.stringify(corpo) : undefined,
      });

      if (!resposta.ok) {
        throw new Error();
      }

      const dados = await resposta.json();
      setPublicacao(metodo === 'DELETE' ? null : dados);
      setMensagem(`${metodo} OK (status ${resposta.status})`);
    } catch (e) {
      setErro('Não foi possível concluir a operação.');
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    requisitar('GET', contador);
  }, []);

  function proximo() {
    const novo = contador + 1;
    setContador(novo);
    requisitar('GET', novo);
  }

  if (carregando) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.texto}>Carregando...</Text>
      </View>
    );
  }

  if (erro) {
    return (
      <View style={styles.container}>
        <Text style={styles.texto}>{erro}</Text>
        <Button title="Tentar novamente" onPress={() => requisitar('GET', contador)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.texto}>Publicação #{publicacao?.id ?? '—'}</Text>
      <Text style={styles.titulo}>{publicacao?.title ?? 'Publicação removida'}</Text>
      <Text style={styles.texto}>{publicacao?.body}</Text>
      <Text style={styles.texto}>{mensagem}</Text>

      <View style={styles.botoes}>
        <Button title="Buscar próximo (GET)" onPress={proximo} />
        <Button
          title="Criar (POST)"
          onPress={() => requisitar('POST', undefined, { title: 'Meu post', body: 'Conteúdo novo' })}
        />
        <Button
          title="Substituir (PUT)"
          onPress={() =>
            requisitar('PUT', contador, { id: contador, title: 'Título trocado', body: 'Corpo trocado' })
          }
        />
        <Button
          title="Atualizar título (PATCH)"
          onPress={() => requisitar('PATCH', contador, { title: 'Só o título mudou' })}
        />
        <Button title="Apagar (DELETE)" onPress={() => requisitar('DELETE', contador)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#fff' },
  texto: { color: '#000' },
  titulo: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  botoes: { marginTop: 16, gap: 8 },
});