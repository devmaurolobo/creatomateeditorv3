import React, { useState, useEffect } from 'react';
import { Preview } from '@creatomate/preview';
import { StyledButton } from './styles/CreateButtonStyles';

interface CreateButtonProps {
  preview: Preview;
}

/**
 * Componente CreateButton
 * - Busca o template atual através de uma API e atualiza o preview.
 * - Exibe o ID do template atual e, se disponível, exibe o conteúdo renderizado.
 */
export const CreateButton: React.FC<CreateButtonProps> = (props) => {
  const [templateId, setTemplateId] = useState<string>('');
  const [render, setRender] = useState<any>();

  // Função que busca o templateId na API e atualiza o preview com a nova fonte
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/api/template');
        const data = await response.json();
        setTemplateId(data.templateId);
        
        // Atualiza o preview caso o templateId seja retornado
        if (props.preview && data.templateId) {
          props.preview.setSource({ templateId: data.templateId });
        }
      } catch (error) {
        console.error('Erro ao buscar template:', error);
      }
    };

    fetchTemplate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez ao montar o componente

  return (
    <div>
      <div>Template atual: {templateId}</div>

      {render && (
        <div>
          <h3>Template Renderizado:</h3>
          <div>{render}</div>
        </div>
      )}

      {/* Exemplo de utilização do StyledButton */}
      <StyledButton onClick={() => console.log('Ação do botão Create')}>
        Criar Vídeo
      </StyledButton>
    </div>
  );
};

/**
 * Função finishVideo
 * - Finaliza a renderização do vídeo enviando os dados da fonte (source) para a API.
 * - Lida com os retornos e erros da requisição.
 */
export const finishVideo = async (preview: Preview) => {
  const response = await fetch('/api/videos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    },
    credentials: 'include',
    body: JSON.stringify({
      source: preview.getSource(),
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('No API key was provided. Please refer to the README.md for instructions.');
    } else {
      throw new Error(`The request failed with status code ${response.status}`);
    }
  }

  const result = await response.json();

  if (result.modifications && typeof result.modifications === 'object') {
    const newModifications = { ...result.modifications };
    await preview.setModifications(newModifications);
    console.log('[setPropertyValue] Preview atualizado com modificações retornadas:', newModifications);
    // Se o preview fornecer um método para forçar a atualização, utilize-o:
    // preview.forceUpdate(); 
  } else {
    console.log('[setPropertyValue] Nenhuma modificação retornada pelo endpoint.');
  }

  return result;
};



