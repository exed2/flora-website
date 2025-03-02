using System;
using System.IO;
using System.Net.Http;
using System.Windows.Forms;

namespace uuidtest
{
    public partial class Form1 : Form
    {
        private string uuid;

        public Form1()
        {
            InitializeComponent();

            uuid = LoadOrGenerateUUID();
            label1.Text = uuid;

            CheckIfBanned(uuid);
        }

        private string LoadOrGenerateUUID()
        {
            string filePath = "uuid.txt";

            if (File.Exists(filePath))
            {
                return File.ReadAllText(filePath);
            }
            else
            {
                string newUuid = Guid.NewGuid().ToString();
                File.WriteAllText(filePath, newUuid);
                return newUuid;
            }
        }

        private async void CheckIfBanned(string uuid)
        {
            using (HttpClient client = new HttpClient())
            {
                try
                {
                    string url = "http://localhost:3000/check-ban?uuid=" + uuid;
                    HttpResponseMessage response = await client.GetAsync(url);

                    if (response.IsSuccessStatusCode)
                    {
                        string result = await response.Content.ReadAsStringAsync();
                        if (result.Contains("\"banned\":true"))
                        {
                            MessageBox.Show("ninja ur bannd from ts", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                            Application.Exit(); 
                        }
                    }
                    else
                    {
                        MessageBox.Show("no loclhst", "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show("Error: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        private void label1_Click(object sender, EventArgs e)
        {
        }

        private void button1_Click(object sender, EventArgs e)
        {
            if (!string.IsNullOrEmpty(label1.Text))
            {
                Clipboard.SetText(label1.Text);
                MessageBox.Show("UUID copied to clipboard!", "Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            }
        }
    }
}
