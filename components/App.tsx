import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Preview, PreviewState } from '@creatomate/preview';
import { useWindowWidth } from '../utility/useWindowWidth';
import { SimpleSettingsPanel } from './SettingsPanel';

const App: React.FC = () => {
  // React Hook to update the component when the window width changes
  const windowWidth = useWindowWidth();

  // Video aspect ratio that can be calculated once the video is loaded
  const [videoAspectRatio, setVideoAspectRatio] = useState<number>();

  // Reference to the preview
  const previewRef = useRef<Preview>();

  // Current state of the preview
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentState, setCurrentState] = useState<PreviewState>();
  const [currentTemplateId, setCurrentTemplateId] = useState<string>();

  // Função para carregar o template
  const loadTemplate = async (preview: Preview) => {
    try {
      console.log('🔄 Tentando carregar template...');
      const response = await fetch('/api/template');
      const data = await response.json();
      console.log('📥 Dados recebidos da API:', data);
      
      if (!data.templateId) {
        throw new Error('Template ID não encontrado');
      }
      
      console.log('⏳ Iniciando carregamento do template:', data.templateId);
      await preview.loadTemplate(data.templateId);
      
      // Verifica se o template foi carregado
      const source = await preview.getSource();
      console.log('🎯 Template source:', source);
      
      setCurrentTemplateId(data.templateId);
      console.log('✅ Template carregado com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao carregar template:', error);
    }
  };

  // This sets up the video player in the provided HTML DIV element
  const setUpPreview = (htmlElement: HTMLDivElement) => {
    console.log('🎥 Iniciando setup do preview...');
    if (previewRef.current) {
      console.log('🧹 Limpando preview anterior...');
      previewRef.current.dispose();
      previewRef.current = undefined;
    }

    const preview = new Preview(htmlElement, 'player', process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN!);

    // Primeiro configuramos todos os handlers
    preview.onReady = async () => {
      console.log('🎬 Preview está pronto');
      previewRef.current = preview; // Só salvamos a referência quando estiver pronto
      setIsReady(true);
      
      // Agora sim carregamos o template
      try {
        await loadTemplate(preview);
        console.log('✅ Setup inicial completo');
      } catch (error) {
        console.error('❌ Erro no setup inicial:', error);
      }
    };

    preview.onLoad = () => {
      console.log('⏳ Iniciando carregamento...');
      setIsLoading(true);
    };

    preview.onLoadComplete = () => {
      console.log('✅ Carregamento completo');
      setIsLoading(false);
    };

    preview.onStateChange = (state) => {
      console.log('🔄 Estado mudou:', state);
      setCurrentState(state);
      setVideoAspectRatio(state.width / state.height);
    };
  };

  // Polling com intervalo maior
  useEffect(() => {
    if (previewRef.current && isReady) {
      console.log('🔄 Iniciando verificação de template...');
      const interval = setInterval(async () => {
        try {
          const response = await fetch('/api/template');
          const data = await response.json();
          
          if (data.templateId !== currentTemplateId) {
            console.log('🔄 Template ID mudou, recarregando...');
            await loadTemplate(previewRef.current!);
          }
        } catch (error) {
          console.error('❌ Erro na verificação:', error);
        }
      }, 5000); // Aumentado para 5 segundos

      return () => clearInterval(interval);
    }
  }, [isReady, currentTemplateId]);

  useEffect(() => {
    if (previewRef.current && windowWidth) {
      console.log('📏 Tamanho da janela mudou, recarregando preview...');
      loadTemplate(previewRef.current);
    }
  }, [windowWidth]);

  return (
    <Component>
      <Wrapper>
        <Container
          id="preview-container"
          ref={(htmlElement) => {
            if (htmlElement && !previewRef.current) {
              setUpPreview(htmlElement);
            }
          }}
        />
      </Wrapper>

      <Panel>
        {isReady && previewRef.current && (
          <PanelContent>
            <SimpleSettingsPanel 
              preview={previewRef.current} 
              currentState={currentState} 
            />
          </PanelContent>
        )}
      </Panel>

      {isLoading && <LoadIndicator>Loading...</LoadIndicator>}
    </Component>
  );
};

export default App;

const Component = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Wrapper = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
`;
const Container = styled.div`
  width: 100%;
  height: 100%;
  margin: auto;

`;

const Panel = styled.div`
  width: 100%;
  background: rgb(238, 238, 238);
  padding: 20px;
  display: none;
  overflow-y: auto;

  @media (min-width: 768px) {
    width: 400px;
    margin: 20px;
    border-radius: 15px;
  }
`;

const PanelContent = styled.div`
  height: 100%;
`;

const LoadIndicator = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 20px;
  border-radius: 5px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;
