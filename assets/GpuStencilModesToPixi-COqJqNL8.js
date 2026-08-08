import{F as e,I as t,L as n,R as r,T as i,w as a}from"./Shader-CvHcEFxT.js";import{h as o}from"./RenderTargetSystem-Bz6yqnjB.js";import{p as s}from"./GCManagedHash-g_34Cda9.js";var c=class{constructor(e){this._syncFunctionHash=Object.create(null),this._adaptor=e,this._systemCheck()}_systemCheck(){if(!o())throw Error(`Current environment does not allow unsafe-eval, please use pixi.js/unsafe-eval module to enable support.`)}ensureUniformGroup(n){let r=this.getUniformGroupData(n);n.buffer||=new e({data:new Float32Array(r.layout.size/4),usage:t.UNIFORM|t.COPY_DST})}getUniformGroupData(e){return this._syncFunctionHash[e._signature]||this._initUniformGroup(e)}_initUniformGroup(e){let t=e._signature,n=this._syncFunctionHash[t];if(!n){let r=Object.keys(e.uniformStructures).map(t=>e.uniformStructures[t]),i=this._adaptor.createUboElements(r),a=this._generateUboSync(i.uboElements);n=this._syncFunctionHash[t]={layout:i,syncFunction:a}}return this._syncFunctionHash[t]}_generateUboSync(e){return this._adaptor.generateUboSync(e)}syncUniformGroup(n,r,i){let a=this.getUniformGroupData(n);n.buffer||=new e({data:new Float32Array(a.layout.size/4),usage:t.UNIFORM|t.COPY_DST});let o=null;return r||(r=n.buffer.data,o=n.buffer.dataInt32),i||=0,a.syncFunction(n.uniforms,r,o,i),!0}updateUniformGroup(e){if(e.isStatic&&!e._dirtyId)return!1;e._dirtyId=0;let t=this.syncUniformGroup(e);return e.buffer.update(),t}destroy(){this._syncFunctionHash=null}},l=[{type:`mat3x3<f32>`,test:e=>e.value.a!==void 0,ubo:`
            var matrix = uv[name].toArray(true);
            data[offset] = matrix[0];
            data[offset + 1] = matrix[1];
            data[offset + 2] = matrix[2];
            data[offset + 4] = matrix[3];
            data[offset + 5] = matrix[4];
            data[offset + 6] = matrix[5];
            data[offset + 8] = matrix[6];
            data[offset + 9] = matrix[7];
            data[offset + 10] = matrix[8];
        `,uniform:`
            gl.uniformMatrix3fv(ud[name].location, false, uv[name].toArray(true));
        `},{type:`vec4<f32>`,test:e=>e.type===`vec4<f32>`&&e.size===1&&e.value.width!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
            data[offset + 2] = v.width;
            data[offset + 3] = v.height;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y || cv[2] !== v.width || cv[3] !== v.height) {
                cv[0] = v.x;
                cv[1] = v.y;
                cv[2] = v.width;
                cv[3] = v.height;
                gl.uniform4f(ud[name].location, v.x, v.y, v.width, v.height);
            }
        `},{type:`vec2<f32>`,test:e=>e.type===`vec2<f32>`&&e.size===1&&e.value.x!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.x;
            data[offset + 1] = v.y;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.x || cv[1] !== v.y) {
                cv[0] = v.x;
                cv[1] = v.y;
                gl.uniform2f(ud[name].location, v.x, v.y);
            }
        `},{type:`vec4<f32>`,test:e=>e.type===`vec4<f32>`&&e.size===1&&e.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
            data[offset + 3] = v.alpha;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue || cv[3] !== v.alpha) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                cv[3] = v.alpha;
                gl.uniform4f(ud[name].location, v.red, v.green, v.blue, v.alpha);
            }
        `},{type:`vec3<f32>`,test:e=>e.type===`vec3<f32>`&&e.size===1&&e.value.red!==void 0,ubo:`
            v = uv[name];
            data[offset] = v.red;
            data[offset + 1] = v.green;
            data[offset + 2] = v.blue;
        `,uniform:`
            cv = ud[name].value;
            v = uv[name];
            if (cv[0] !== v.red || cv[1] !== v.green || cv[2] !== v.blue) {
                cv[0] = v.red;
                cv[1] = v.green;
                cv[2] = v.blue;
                gl.uniform3f(ud[name].location, v.red, v.green, v.blue);
            }
        `}];function u(e,t,n,r){let i=[`
        var v = null;
        var v2 = null;
        var t = 0;
        var index = 0;
        var name = null;
        var arrayOffset = null;
    `],a=0;for(let o=0;o<e.length;o++){let s=e[o],c=s.data.name,u=!1,d=0;for(let e=0;e<l.length;e++)if(l[e].test(s.data)){d=s.offset/4,i.push(`name = "${c}";`,`offset += ${d-a};`,l[e][t]||l[e].ubo),u=!0;break}if(!u){if(s.data.size>1)d=s.offset/4,i.push(n(s,d-a));else{let e=r[s.data.type];d=s.offset/4,i.push(`
                    v = uv.${c};
                    offset += ${d-a};
                    ${e};
                `)}}a=d}let o=i.join(`
`);return Function(`uv`,`data`,`dataInt32`,`offset`,o)}function d(e,t){return`
        for (let i = 0; i < ${e*t}; i++) {
            data[offset + (((i / ${e})|0) * 4) + (i % ${e})] = v[i];
        }
    `}var f={f32:`
        data[offset] = v;`,i32:`
        dataInt32[offset] = v;`,"vec2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];`,"vec3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];`,"vec4<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];`,"vec2<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];`,"vec3<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];`,"vec4<i32>":`
        dataInt32[offset] = v[0];
        dataInt32[offset + 1] = v[1];
        dataInt32[offset + 2] = v[2];
        dataInt32[offset + 3] = v[3];`,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 4] = v[2];
        data[offset + 5] = v[3];`,"mat3x3<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 4] = v[3];
        data[offset + 5] = v[4];
        data[offset + 6] = v[5];
        data[offset + 8] = v[6];
        data[offset + 9] = v[7];
        data[offset + 10] = v[8];`,"mat4x4<f32>":`
        for (let i = 0; i < 16; i++) {
            data[offset + i] = v[i];
        }`,"mat3x2<f32>":d(3,2),"mat4x2<f32>":d(4,2),"mat2x3<f32>":d(2,3),"mat4x3<f32>":d(4,3),"mat2x4<f32>":d(2,4),"mat3x4<f32>":d(3,4)},p={...f,"mat2x2<f32>":`
        data[offset] = v[0];
        data[offset + 1] = v[1];
        data[offset + 2] = v[2];
        data[offset + 3] = v[3];
    `},m=class extends r{constructor({buffer:e,offset:t,size:r}){super(),this.uid=n(`buffer`),this._resourceType=`bufferResource`,this._touched=0,this._resourceId=n(`resource`),this._bufferResource=!0,this.destroyed=!1,this.buffer=e,this.offset=t|0,this.size=r,this.buffer.on(`change`,this.onBufferChange,this)}onBufferChange(){this._resourceId=n(`resource`),this.emit(`change`,this)}destroy(e=!1){this.destroyed=!0,e&&this.buffer.destroy(),this.emit(`change`,this),this.buffer=null,this.removeAllListeners()}},h={name:`local-uniform-bit`,vertex:{header:`

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `,main:`
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `,end:`
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `}},g={...h,vertex:{...h.vertex,header:h.vertex.header.replace(`group(1)`,`group(2)`)}},_={name:`local-uniform-bit`,vertex:{header:`

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `,main:`
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `,end:`
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `}},v={name:`texture-bit`,vertex:{header:`

        struct TextureUniforms {
            uTextureMatrix:mat3x3<f32>,
        }

        @group(2) @binding(2) var<uniform> textureUniforms : TextureUniforms;
        `,main:`
            uv = (textureUniforms.uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
            @group(2) @binding(0) var uTexture: texture_2d<f32>;
            @group(2) @binding(1) var uSampler: sampler;


        `,main:`
            outColor = textureSample(uTexture, uSampler, vUV);
        `}},y={name:`texture-bit`,vertex:{header:`
            uniform mat3 uTextureMatrix;
        `,main:`
            uv = (uTextureMatrix * vec3(uv, 1.0)).xy;
        `},fragment:{header:`
        uniform sampler2D uTexture;


        `,main:`
            outColor = texture(uTexture, vUV);
        `}};function b(e,t){for(let n in e.attributes){let r=e.attributes[n],a=t[n];a?(r.format??=a.format,r.offset??=a.offset,r.instance??=a.instance):i(`Attribute ${n} is not present in the shader, but is present in the geometry. Unable to infer attribute details.`)}x(e)}function x(e){let{buffers:t,attributes:n}=e,r={},i={};for(let e in t){let n=t[e];r[n.uid]=0,i[n.uid]=0}for(let e in n){let t=n[e];r[t.buffer.uid]+=a(t.format).stride}for(let e in n){let t=n[e];t.stride??=r[t.buffer.uid],t.start??=i[t.buffer.uid],i[t.buffer.uid]+=a(t.format).stride}}var S=[];S[s.NONE]=void 0,S[s.DISABLED]={stencilWriteMask:0,stencilReadMask:0},S[s.RENDERING_MASK_ADD]={stencilFront:{compare:`equal`,passOp:`increment-clamp`},stencilBack:{compare:`equal`,passOp:`increment-clamp`}},S[s.RENDERING_MASK_REMOVE]={stencilFront:{compare:`equal`,passOp:`decrement-clamp`},stencilBack:{compare:`equal`,passOp:`decrement-clamp`}},S[s.MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:`equal`,passOp:`keep`},stencilBack:{compare:`equal`,passOp:`keep`}},S[s.INVERSE_MASK_ACTIVE]={stencilWriteMask:0,stencilFront:{compare:`not-equal`,passOp:`keep`},stencilBack:{compare:`not-equal`,passOp:`keep`}};export{h as a,m as c,u as d,l as f,y as i,f as l,b as n,_ as o,c as p,v as r,g as s,S as t,p as u};