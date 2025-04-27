import { Kotemari } from '../src/kotemari';

async function main() {
  // プロジェクトルートを指定してKotemariを初期化
  const kotemari = new Kotemari({
    projectRoot: './',
    mode: 'balanced', // 'aggressive' | 'balanced' | 'conservative'
    logLevel: 'info',
  });

  // プロジェクト全体の依存関係を解析
  await kotemari.analyzeProject();

  // 解析対象ファイル一覧を取得
  const files = kotemari.listFiles();
  console.log('Files:', files);

  // 依存関係を取得
  if (files.length > 0) {
    const deps = kotemari.getDependencies(files[0].path);
    console.log(`Dependencies of ${files[0].path}:`, deps);
  }

  // 文脈（コンテキスト）を取得
  if (files.length > 0) {
    const context = await kotemari.getContext(files[0].path);
    console.log(`Context for ${files[0].path}:\n`, context);
  }
}

main().catch(console.error);
