import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Preview } from '@creatomate/preview';
import { Button } from './Button';

interface CreateButtonProps {
  preview: Preview;
}

export const CreateButton: React.FC<CreateButtonProps> = (props) => {
  const [templateId, setTemplateId] = useState<string>('');
  const [render, setRender] = useState<any>();

  // Buscar o templateId atual e atualizar o preview
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await fetch('/api/template');
        const data = await response.json();
        setTemplateId(data.templateId);
        
        // Atualiza o preview com o novo templateId
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
    </div>
  );
};

const Component = styled(Button)`  display: block;
  margin-left: auto;
`;

const finishVideo = async (preview: Preview) => {
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

  return await response.json();
};



