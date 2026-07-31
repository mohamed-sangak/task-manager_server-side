import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

// Initialize zod extension for OpenAPI metadata support
extendZodWithOpenApi(z);
