using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.VFX;
 
public class PointCloudRender : MonoBehaviour {
    Texture2D texColor;
    Texture2D texPosScale;
    VisualEffect vfx;
    uint resolution = 2048;

    public MeshFilter mesh;
    public float particleSize = 0.1f;
    bool toUpdate = false;
    uint particleCount = 0;
    int capacity = 5000000;

    private void Start()
    {
        vfx = GetComponent<VisualEffect>();

        print(mesh.sharedMesh.isReadable);

        //Vector3[] positions = new Vector3[capacity];
        Color[] colors = new Color[capacity];

        var points = mesh.sharedMesh.vertices;
        //var colors = mesh.mesh.colors;

        for (int i = 0; i < points.Length; i++)
        {
            //positions[i] = new Vector3(Random.value, Random.value, Random.value);
            colors[i] = new Color(Random.value, Random.value, Random.value, 1);
        }

        SetParticles(points, colors);
    }

    private void Update()
    {
        if (toUpdate)
        {
            toUpdate = false;

            vfx.Reinit();
            vfx.SetUInt(Shader.PropertyToID("ParticleCount"), particleCount);
            vfx.SetTexture(Shader.PropertyToID("TexColor"), texColor);
            vfx.SetTexture(Shader.PropertyToID("TexPosScale"), texPosScale);
            vfx.SetUInt(Shader.PropertyToID("Resolution"), resolution);
        }
    }

    public void SetParticles(Vector3[] positions, Color[] colors)
    {
        texColor = new Texture2D(positions.Length > (int)resolution ? (int)resolution : positions.Length, Mathf.Clamp(positions.Length / (int)resolution, 1, (int)resolution), TextureFormat.RGBAFloat, false);
        texPosScale = new Texture2D(positions.Length > (int)resolution ? (int)resolution : positions.Length, Mathf.Clamp(positions.Length / (int)resolution, 1, (int)resolution), TextureFormat.RGBAFloat, false);
        int texWidth = texColor.width;
        int texHeight = texColor.height;

        for (int y = 0; y < texHeight; y++)
        {
            for (int x = 0; x < texWidth; x++)
            {
                int index = x + y * texWidth;
                texColor.SetPixel(x, y, colors[index]);
                var data = new Color(positions[index].x, positions[index].y, positions[index].z, particleSize);
                texPosScale.SetPixel(x, y, data);
            }
        }

        texColor.Apply();
        texPosScale.Apply();
        particleCount = (uint)positions.Length;
        toUpdate = true;
    }
}