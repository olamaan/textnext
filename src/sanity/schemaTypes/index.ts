import { type SchemaTypeDefinition } from 'sanity'

import {blockContentType} from './blockContentType'
import {categoryType} from './categoryType'
import {postType} from './postType'
import {authorType} from './authorType'
import {sdgType} from './sdgType'          
import {themeType} from './themeType'      
import {countryType} from './countryType' 




export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    blockContentType,
    categoryType,
    postType,
    authorType,
    sdgType,
    themeType,
    countryType,
  ],
}

