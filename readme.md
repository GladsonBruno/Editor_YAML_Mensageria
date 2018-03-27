Pré Requisitos para Build:
    Windows:
        Python 2.7
        VisualStudio Community com C++
        NodeJS
        Electron instalado Globalmente


    Mac:
        NodeJS
        Electron instalado Globalmente
        C++:
            XCode with command line tools


    Linux:
        Python 2.7
        NodeJS
        Electron instalado Globalmente
        C++:
            Instalar pacote "build-essential" para ubuntu ou "gcc-c++" e "make" para Fedora


Variáveis de Ambiente:
    Definindo Variáveis de Ambiente Sistemas UNIX:
        export variavel=value


    Windows:
        Variaveis a Definir:
            GYP_MSVS_VERSION
                Referente a versão do VisualStudio.
                    Ex: GYP_MSVS_VERSION=2017


            npm_config_arch
                Arquitetura da Máquina.
                    Ex npm_config_arch=x64 ou npm_config_target=x86


            npm_config_target
                Referente a Versão do Electron da Máquina.
                    Ex: npm_config_target=1.8.2


        Variáveis com Valores Padrão:
            npm_config_build_from_source=true
            npm_config_disturl=https://atom.io/download/electron
            npm_config_runtime=electron
        

    Linux e Mac:
        Variaveis a Definir:
            GYP_MSVS_VERSION
                Referente a versão do VisualStudio.
                    Ex: GYP_MSVS_VERSION=2017


            npm_config_arch
                Arquitetura da Máquina.
                    Ex npm_config_arch=x64 ou npm_config_target=x86


            npm_config_target
                Referente a Versão do Electron da Máquina.
                    Ex: npm_config_target=1.8.2

        Variáveis com Valores Padrão:
            npm_config_build_from_source=true
            npm_config_disturl=https://atom.io/download/electron
            npm_config_runtime=electron


Instruções de Build
    Rodar a Aplicação Para Debug: npm start

    Gerar instalador: npm run dist
    Gerar pacote: npm run pack


    Gerando Build do Instalador Linux:
        Na seção linux trocar a propriedade target de acordo com o tipo de arquivo que será gerado.
        Ex: deb para debian, rpm para Fedora, Red Hat. Etc.


    Instalar arquivos gerado para debian - Extensão .DEB: 
        Substituir na seção linux o valor da propriedade target para "deb"
        Gerando build: npm run dist
            Instalando Aplicação:
                sudo dpkg -i aplicacao.deb


    //Extensão .RPM
    Para Linux: Red Hat Enterprise Linux, Fedora, CentOS, openSUSE
        Substituir na seção linux o valor da propriedade target para "rpm"
        Gerando build: npm run dist
            Instalando aplicação extenção RPM:
                sudo rpm -i applicacao.rpm


    Gerar extensão .app - Imagem de aplicativo
        Substituir na seção linux o valor da propriedade target para "AppImage"
            Gerando build: npm run dist


    Gerar SNAP package - Pode ser usado no ubuntu
        Gerando build: npm run dist
            Instalando Aplicação:
                sudo snap install --dangerous aplicacao.SNAP


    Gerando Build Instalador Mac:
        Na seção mac trocar a propriedade target de acordo com o tipo de arquivo que será gerado.
        Ex: dmg, pkg, etc.
            Gerar instalador: npm run dist
            Gerar pacote: npm run pack


    Gerar instalador DMG
        Substituir na seção MAC o valor da propriedade target para "dmg"
        Gerando build: npm run dist
        O Instalador será gerado na pasta dist


    Gerar instalador PKG
        Substituir na seção MAC o valor da propriedade target para pkg
        Gerando build: npm run dist
        O Instalador será gerado na pasta dist
