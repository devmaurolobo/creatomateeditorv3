import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Preview, PreviewState } from '@creatomate/preview';
import { TextInput } from './TextInput';
import { ImageOption } from './ImageOption';
import { Button } from './Button';
import { CreateButton } from './CreateButton';

interface SettingsPanelProps {
  preview: Preview;
  currentState?: PreviewState;
}

const colorPalette = [
  '#FF5733', '#33FF57', '#3357FF', '#F39C12', '#8E44AD', '#E74C3C', '#1ABC9C'
];

export const SimpleSettingsPanel: React.FC<SettingsPanelProps> = ({ preview, currentState }) => {
  console.log('🎨 Estado atual:', currentState);
  console.log('🎬 Preview:', preview);
  
  const modificationsRef = useRef<Record<string, any>>({});

  // 1. Polling via useEffect
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('https://creatomateeditorv3.vercel.app/api/update-properties');
        if (!response.ok) {
          throw new Error(`[Polling] Erro: ${response.status}`);
        }
        const data = await response.json();
        // Se o backend devolver modifications atualizadas, atualizar o preview
        if (data.modifications) {
          // Só atualiza se tiver diferença
          if (JSON.stringify(modificationsRef.current) !== JSON.stringify(data.modifications)) {
            modificationsRef.current = data.modifications;
            await preview.setModifications(modificationsRef.current);
            console.log('[Polling] Preview atualizado com modificações do backend');
          }
        }
      } catch (error) {
        console.error('[Polling] Erro GEN:', error);
      }
    }, 4000); // a cada 4 segundos (exemplo)
    return () => clearInterval(interval);
  }, [preview]);

  if (!preview) {
    console.error('Preview não está definido');
    return null;
  }

  const findElement = (elementName: string) => {
    try {
      return preview.getElements().find((element) => element.source.name === elementName);
    } catch (error) {
      console.error('Erro ao buscar elemento:', error);
      return null;
    }
  };

  return (
    <div>
      <CreateButton preview={preview} />
      {/* Grupo de Textos */}
      <Group>
        <GroupTitle>Textos</GroupTitle>
        {['Title', 'Subtitle', 'Description', 'Value', 'Footer'].map((textName, index) => (
          <TextInput
            key={textName}
            placeholder={textName}
            onFocus={() => ensureElementVisibility(preview, textName, 1.5)}
            onChange={(e) =>
              setPropertyValue(preview, textName, e.target.value, modificationsRef.current)
            }
          />
        ))}
      </Group>
      {/* Grupo de Imagens */}
      <Group>
        <GroupTitle>Imagens</GroupTitle>
        {[1, 2].map((index) => (
          <div key={index}>
            <SubGroupTitle>Imagem {index}</SubGroupTitle>
            {findElement(`Image${index}`) && (
              <ImageOptions>
                {[
                  'https://creatomate-static.s3.amazonaws.com/demo/harshil-gudka-77zGnfU_SFU-unsplash.jpg',
                  'https://creatomate-static.s3.amazonaws.com/demo/samuel-ferrara-1527pjeb6jg-unsplash.jpg',
                  'https://creatomate-static.s3.amazonaws.com/demo/simon-berger-UqCnDyc_3vA-unsplash.jpg'
                ].map((url) => (
                  <ImageOption
                    key={url}
                    url={url}
                    onClick={async () => {
                      const imageElement = findElement(`Image${index}`);
                      if (imageElement) {
                        await ensureElementVisibility(preview, imageElement.source.name, 1.5);
                        await setPropertyValue(
                          preview,
                          imageElement.source.name,
                          url,
                          modificationsRef.current
                        );
                      }
                    }}
                  />
                ))}
              </ImageOptions>
            )}
          </div>
        ))}
      </Group>
      {/* Grupo de Cores */}
      <Group>
        <GroupTitle>Cores</GroupTitle>
        {[1, 2, 3].map((index) => (
          <div key={index}>
            <SubGroupTitle>Shape {index}</SubGroupTitle>
            <ColorOptions>
              {colorPalette.map((color) => (
                <ColorBox
                  key={color}
                  color={color}
                  onClick={async () => {
                    const shapeElement = findElement(`Shape${index}`);
                    if (shapeElement) {
                      await setPropertyValue(
                        preview,
                        `${shapeElement.source.name}.fill_color`,
                        color,
                        modificationsRef.current
                      );
                    }
                  }}
                />
              ))}
            </ColorOptions>
          </div>
        ))}
      </Group>
      <Button onClick={() => console.log('Ação adicional')} style={{ width: '100%' }}>
        Executar Ação
      </Button>
    </div>
  );
};

const Group = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f5f7f8;
  border-radius: 5px;
`;

const GroupTitle = styled.div`
  margin-bottom: 15px;
  font-weight: 600;
`;

const SubGroupTitle = styled.div`
  margin: 10px 0 5px 0;
  font-weight: 500;
`;

const ImageOptions = styled.div`
  display: flex;
  margin: 10px -10px 0 -10px;
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 30px;
  height: 30px;
  border-radius: 5px;
  background-color: ${(props) => props.color};
  cursor: pointer;
  border: 2px solid #ccc;
  &:hover {
    border-color: #000;
  }
`;

/**
 * Função setPropertyValue
 * - Atualiza o valor de uma propriedade no preview e armazena a modificação.
 * - Se o parâmetro 'postEndpoint' for informado, envia os dados via POST para o endpoint.
 * - Ao receber a resposta, atualiza o preview com as modificações retornadas.
 */
const setPropertyValue = async (
  preview: Preview,
  selector: string,
  value: string,
  modifications: Record<string, any>,
  postEndpoint?: string // Endpoint opcional para envio dos dados via POST
) => {
  console.log('[setPropertyValue] Início da execução', { selector, value, modifications });

  // Atualiza as modificações localmente no cliente.
  if (value.trim()) {
    modifications[selector] = value;
  } else {
    delete modifications[selector];
  }
  console.log('[setPropertyValue] Modificações após update do cliente:', modifications);

  // Atualiza o preview com as modificações atuais.
  await preview.setModifications(modifications);
  console.log('[setPropertyValue] preview.setModifications aplicado:', modifications);

  // Se um endpoint for definido, envia os dados via POST.
  if (postEndpoint) {
    console.log(`[setPropertyValue] Enviando dados para endpoint: ${postEndpoint}`);
    try {
      const response = await fetch(postEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selector, value, modifications })
      });
      
      console.log('[setPropertyValue] Resposta do fetch:', response);

      if (!response.ok) {
        throw new Error(`Falha ao enviar os dados: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[setPropertyValue] Dados retornados do endpoint:', result);

      // Se houver modificações retornadas, atualiza o preview novamente.
      if (result.modifications) {
        await preview.setModifications(result.modifications);
        console.log('[setPropertyValue] Preview atualizado com modificações retornadas:', result.modifications);
        // Opcional: atualizar também a referência/estado com as novas modificações.
        // Exemplo: modificationsRef.current = result.modifications;
      }
    } catch (error) {
      console.error('[setPropertyValue] Erro ao enviar os dados via POST:', error);
    }
  } else {
    console.log('[setPropertyValue] Nenhum endpoint definido para envio dos dados');
  }
};

const ensureElementVisibility = async (preview: Preview, elementName: string, addTime: number) => {
  const element = preview.getElements().find((element) => element.source.name === elementName);
  if (element) {
    await preview.setTime(element.globalTime + addTime);
  }
};

export default SimpleSettingsPanel;

