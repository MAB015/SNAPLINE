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

## Acuerdo firmado (D2)

Dominio EIP-712: `name: SNAPLINE`, `version: 1`, `chainId` de la cadena
actual y `verifyingContract` igual al factory. Para el demo, chainId es 84532.
El salt pertenece al acuerdo, no es un campo adicional del dominio.

Tipo exacto: `Agreement(address[] participants,uint16[] bps,bytes32 termsHash,bytes32 salt)`.
Los arreglos conservan el orden: cada firma debe corresponder al participante
del mismo índice. Los elementos se codifican en palabras de 32 bytes según
EIP-712, incluso los uint16. Nunca se firman los términos en texto, solo su hash.

`createPool(agreement, signatures)` devuelve la dirección del clon y emite
`PoolCreated(pool, structHash)` con ambos campos indexados. Cualquier cuenta
puede enviar el paquete firmado; el remitente no obtiene permisos especiales.
El constructor del factory crea la implementación y `implementation()` devuelve
su dirección. `consumed(structHash)` identifica acuerdos ya desplegados.

El clon queda inicializado en la misma transacción. Cada participante usa
`withdraw(token)` desde su cuenta; `address(0)` representa ETH. `releasable(token,
account)` indica el saldo disponible, y `totalReceived(token)` reconstruye el
histórico. Los tokens del demo son MockUSDT; no se promete soporte para tokens
maliciosos o con rebasing.
