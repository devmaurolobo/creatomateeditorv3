import React, { useRef } from 'react';
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

export const SimpleSettingsPanel: React.FC<SettingsPanelProps> = (props) => {
  const modificationsRef = useRef<Record<string, any>>({});

  const findElement = (elementName: string) => {
    return props.preview.getElements().find((element) => element.source.name === elementName);
  };

  return (
    <div>
      <CreateButton preview={props.preview} />
      {/* Grupo de Textos */}
      <Group>
        <GroupTitle>Textos</GroupTitle>
        {['Title', 'Subtitle', 'Description', 'Value', 'Footer'].map((textName, index) => (
          <TextInput
            key={textName}
            placeholder={textName}
            onFocus={() => ensureElementVisibility(props.preview, textName, 1.5)}
            onChange={(e) =>
              setPropertyValue(props.preview, textName, e.target.value, modificationsRef.current)
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
                        await ensureElementVisibility(props.preview, imageElement.source.name, 1.5);
                        await setPropertyValue(
                          props.preview,
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
                        props.preview,
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

const setPropertyValue = async (
  preview: Preview,
  selector: string,
  value: string,
  modifications: Record<string, any>,
) => {
  if (value.trim()) {
    modifications[selector] = value;
  } else {
    delete modifications[selector];
  }
  await preview.setModifications(modifications);
};

const ensureElementVisibility = async (preview: Preview, elementName: string, addTime: number) => {
  const element = preview.getElements().find((element) => element.source.name === elementName);
  if (element) {
    await preview.setTime(element.globalTime + addTime);
  }
};

export default SimpleSettingsPanel;

