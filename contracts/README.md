# contracts

Solidity 0.8.24 + Foundry 1.8.3. Desde Git Bash, en este directorio:

```bash
git submodule update --init --recursive
~/.foundry/bin/forge test
~/.foundry/bin/forge fmt --check
```

Dependencias fijadas: OpenZeppelin Contracts v5.0.2 y forge-std v1.9.7.
Fuzzing: 1000 casos por test. No requiere RPC ni claves privadas.

Ver `docs/ARCHITECTURE.md` seccion 2 para el diseno de `SplitPool`,
`SplitPoolFactory` y `MockUSDT`, y `docs/THREAT-MODEL.md` seccion 6 para la
lista de tests que deben pasar.
