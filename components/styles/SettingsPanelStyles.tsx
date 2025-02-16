import styled from 'styled-components';

/**
 * Grupo é um container para agrupar seções do painel de configurações.
 */
export const Group = styled.div`
  margin: 20px 0;
  padding: 20px;
  background: #f5f7f8;
  border-radius: 5px;
`;

/**
 * GroupTitle define o estilo dos títulos dos grupos.
 */
export const GroupTitle = styled.div`
  margin-bottom: 15px;
  font-weight: 600;
`;

/**
 * SubGroupTitle define o estilo dos subtítulos utilizados para subdividir os grupos.
 */
export const SubGroupTitle = styled.div`
  margin: 10px 0 5px 0;
  font-weight: 500;
`;

/**
 * ImageOptions é o container para as opções de imagem.
 */
export const ImageOptions = styled.div`
  display: flex;
  margin: 10px -10px 0 -10px;
`;

/**
 * ColorOptions é o container que organiza as opções de cor.
 */
export const ColorOptions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

/**
 * ColorBox representa uma caixa de cor que pode ser selecionada.
 */
export const ColorBox = styled.div<{ color: string }>`
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