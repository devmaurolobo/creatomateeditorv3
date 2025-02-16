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
      
      console.log('⏳ Iniciando carregamento do template:', data.templateId);
      try {
        // Adicionando timeout para evitar travamento infinito
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout ao carregar template')), 10000);
        });

        // Race entre o carregamento do template e o timeout
        await Promise.race([
          preview.loadTemplate(data.templateId),
          timeoutPromise
        ]);

        console.log('🎯 Template source:', await preview.getSource());
        setCurrentTemplateId(data.templateId);
        console.log('✅ Template carregado com sucesso!');
      } catch (error) {
        console.error('❌ Erro ao carregar template:', error);
        // Tenta recuperar o estado atual do preview
        try {
          const currentSource = await preview.getSource();
          console.error('📊 Estado atual do preview:', {
            source: currentSource,
          });
        } catch (e) {
          console.error('❌ Não foi possível obter estado do preview:', e);
        }
        
        // Tenta reiniciar o preview em caso de erro
        try {
          console.log('🔄 Tentando reiniciar preview...');
          preview.dispose();
          setUpPreview(preview.element);
        } catch (e) {
          console.error('❌ Erro ao reiniciar preview:', e);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao buscar template da API:', error);
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

    console.log('🔑 Token:', process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN);
    const preview = new Preview(htmlElement, 'player', process.env.NEXT_PUBLIC_CREATOMATE_PUBLIC_TOKEN!);

    preview.onReady = async () => {
      console.log('🎬 Preview está pronto, carregando template inicial...');
      await loadTemplate(preview);
      console.log('✅ Setup inicial completo');
      setIsReady(true);
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

    previewRef.current = preview;
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

  return (
    <Component>
      <Wrapper>
        <Container
          ref={(htmlElement) => {
            if (htmlElement && htmlElement !== previewRef.current?.element) {
              setUpPreview(htmlElement);
            }
          }}
          style={{
            height:
              videoAspectRatio && windowWidth && windowWidth < 768 ? window.innerWidth / videoAspectRatio : undefined,
          }}
        />
      </Wrapper>

      <Panel>
        {isReady && (
          <PanelContent id="panel">
            <SimpleSettingsPanel preview={previewRef.current!} currentState={currentState} />
          </PanelContent>
        )}
      </Panel>

      {isLoading && <LoadIndicator>Loading...</LoadIndicator>}
    </Component>
  );
};

export default App;

const Component = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  

  @media (min-width: 768px) {
    flex-direction: row;
    
  }
`;

const Wrapper = styled.div`
  display: flex;

  @media (min-width: 768px) {
    flex: 1;
    padding: 20px;
    
  }
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  max-width: 720px;
  max-height: 720px;
  margin: auto;
`;

const Panel = styled.div`
  flex: 1;
  position: relative;
  background:rgb(238, 238, 238);
  box-shadow: rgba(190, 48, 48, 0.1) 0 6px 15px 0;

  @media (min-width: 768px) {
    flex: initial;
    margin: 50px;
    width: 400px;
    border-radius: 15px;
  }
`;

const PanelContent = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 20px;
  overflow: auto;
`;

const LoadIndicator = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 5px 15px;
  background: #ffff;
  box-shadow: rgba(0, 0, 0, 0.1) 0 6px 15px 0;
  border-radius: 5px;
  font-size: 15px;
  font-weight: 600;

  @media (min-width: 768px) {
    top: 50px;
    left: calc((100% - 400px) / 2);
  }
`;
